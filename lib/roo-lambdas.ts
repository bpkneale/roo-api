import * as core from "@aws-cdk/core";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import * as sqs from "@aws-cdk/aws-sqs";
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Duration } from '@aws-cdk/core';

export class RooLambdas extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const db = dynamo.Table.fromTableArn(scope, "RooServiceDb-lambs", process.env.DYNAMO_ARN);

    const dlq = new sqs.Queue(this, "telemetry-dlq")
    const q = new sqs.Queue(this, "telemetry-queue", {
      deadLetterQueue: {
        queue: dlq,
        maxReceiveCount: 2
      }
    })

    const telemetryReader = new lambda.Function(this, "telemetry-reader", {
      runtime: lambda.Runtime.NODEJS_14_X, // So we can use async in widget.js
      code: lambda.Code.fromAsset("resources/lambdas"),
      handler: "telemetry.handler",
      environment: {
      }
    });

    db.grantReadWriteData(telemetryReader);

    telemetryReader.addEventSource(
      new SqsEventSource(q, {
        batchSize: 60,
        maxBatchingWindow: Duration.minutes(5),
      }),
    )
  }
}