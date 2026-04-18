#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TdeeCertStack, TdeeStack } from '../lib/tdee-stack';

const app = new cdk.App();
const account = '778021795831';

const certStack = new TdeeCertStack(app, 'TdeeCert', {
  env: { account, region: 'us-east-1' },
  crossRegionReferences: true,
});

const siteStack = new TdeeStack(app, 'Tdee', {
  env: { account, region: 'ap-northeast-2' },
  crossRegionReferences: true,
  certificate: certStack.certificate,
});

siteStack.addDependency(certStack);
