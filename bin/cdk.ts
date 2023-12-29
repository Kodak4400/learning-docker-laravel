// import * as cdk from '@aws-cdk/core';
import * as cdk from 'aws-cdk-lib';
import { stringToBoolean } from '../lib/common';
import { SetupStack } from '../lib/stack/setup-stack';
import { devParameter, prdParameter, type AppParameter } from './parameter';
import { LaravelAppStack } from '../lib/stack/laravel-app-stack';

const app = new cdk.App();

const envKeyContext = 'env';
const setupKeyContext = 'setup';

const envKey = app.node.tryGetContext(envKeyContext) as string;
const setupKey = app.node.tryGetContext(setupKeyContext) as string;

if (envKey === undefined || setupKey === undefined)
    throw new Error(
        `Please context option. ex) cdk deploy -c ${envKey}={ dev | prod } -c ${setupKey}={ boolean }`,
    );

const parameters = [devParameter, prdParameter];
const appParameter: AppParameter = parameters.filter(
    (obj: AppParameter) => obj.envName === envKey,
)[0];

if (stringToBoolean(setupKey)) {
    new SetupStack(app, `${appParameter.envName}SetupStack`, {
        ...appParameter,
    });
} else {
    new LaravelAppStack(app, `${appParameter.envName}LaravelAppStack`, {
        ...appParameter,
    });
}
