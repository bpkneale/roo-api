import * as cdk from '@aws-cdk/core';
import { RooLambdas } from './roo-lambdas';
import { RooService } from "./roo-service";
import { RooSpa } from './roo-spa';

export class RooApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const service = new RooService(this, "Roo-Service");
    new RooSpa(this, "Roo-WebApp", {
      apiUrl: service.url,
      websocketApiUrl: service.socketUrl
    });

    new RooLambdas(this, "roo-lambdas");
  }
}
