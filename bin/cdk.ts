// import * as cdk from '@aws-cdk/core';
import * as cdk from "aws-cdk-lib";
import { FargateSampleStack } from '../lib/stack/fargate-sample-stack';
import { devParameter, prdParameter, type AppParameter } from "./parameter";

const app = new cdk.App();

// const argContext = "environment";
const envKey = app.node.tryGetContext('envName');
const parameters = [devParameter, prdParameter];
const appParameter: AppParameter = parameters.filter(
  (obj: AppParameter) => obj.envName === envKey
)[0];


new FargateSampleStack(
  app,
  `${appParameter.envName}FargateSampleStack`,
  {
    ...appParameter,
  }
)
