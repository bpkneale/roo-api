#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RooApiStack } from '../lib/roo-api-stack';

const app = new cdk.App();
new RooApiStack(app, 'RooApiStack', {
  env: { account: process.env.AWS_ACCOUNT_ID, region: 'ap-southeast-2' },
});
