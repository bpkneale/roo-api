import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigatewayv2";
import * as integrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as s3 from "@aws-cdk/aws-s3";
import { Cors } from "@aws-cdk/aws-apigateway";
import { Duration } from "@aws-cdk/core";

export class RooService extends core.Construct {
  url: string;
  socketUrl: string;

  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    // Or create a new one
    const db = dynamo.Table.fromTableArn(scope, "RooServiceDb", process.env.DYNAMO_ARN);
    const bucket = s3.Bucket.fromBucketName(scope, "roo-bucket", process.env.S3_BUCKET_NAME);

    const handler = new lambda.Function(this, "RooHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/api"),
      handler: "api.main",
      timeout: Duration.seconds(30),
      memorySize: 512,
      environment: {
      }
    });

    db.grantReadWriteData(handler);
    bucket.grantReadWrite(handler);

    const lambdaRooIntegration = new integrations.LambdaProxyIntegration({
      handler,
    });

    const api = new apigateway.HttpApi(this, "roo-api", {
      apiName: "Roo Service",
      description: "This service serves roo data.",
      defaultIntegration: lambdaRooIntegration,
      corsPreflight: {
        allowHeaders: ['Authorization'],
        allowMethods: [apigateway.CorsHttpMethod.GET, apigateway.CorsHttpMethod.HEAD, apigateway.CorsHttpMethod.OPTIONS, apigateway.CorsHttpMethod.POST],
        allowOrigins: ['*'],
        maxAge: Duration.days(10),
      },
    });

    this.url = api.apiEndpoint;

    const connectHandler = new lambda.Function(this, "RooHandler-websocket-connect", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/websocket"),
      handler: "api.connectHandler",
      environment: {
      }
    });

    const disconnectHandler = new lambda.Function(this, "RooHandler-websocket-disconnect", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/websocket"),
      handler: "api.disconnectHandler",
      environment: {
      }
    });

    const defaultHandler = new lambda.Function(this, "RooHandler-websocket-default", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources/websocket"),
      handler: "api.defaultHandler",
      environment: {
      }
    });
    
    db.grantReadWriteData(connectHandler);
    db.grantReadWriteData(disconnectHandler);
    db.grantReadWriteData(defaultHandler);

    const webSocketApi = new apigateway.WebSocketApi(this, 'mywsapi', {
      connectRouteOptions: { integration: new integrations.LambdaWebSocketIntegration({ handler: connectHandler }) },
      disconnectRouteOptions: { integration: new integrations.LambdaWebSocketIntegration({ handler: disconnectHandler }) },
      defaultRouteOptions: { integration: new integrations.LambdaWebSocketIntegration({ handler: defaultHandler }) },
    });
    
    const socketStage = new apigateway.WebSocketStage(this, 'mystage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true
    });

    this.socketUrl = socketStage.url;
  }
}