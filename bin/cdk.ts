// import * as cdk from '@aws-cdk/core';
import * as cdk from 'aws-cdk-lib';
import { devParameter, prdParameter, type AppParameter } from './parameter';
import { SetupStack } from '../lib/stack/setup-stack';
import { LaravelAppStack } from '../lib/stack/laravel-app-stack';
import { DeployStack } from '../lib/stack/deploy-stack';

const app = new cdk.App();

const envKeyContext = 'env';
const taskKeyContext = 'task';

const envKey = app.node.tryGetContext(envKeyContext) as string;
const taskKey = app.node.tryGetContext(taskKeyContext) as string;

if (envKey === undefined || taskKey === undefined)
    throw new Error(
        `Please context option. ex) cdk deploy -c ${envKey}={ dev | prod } -c ${taskKey}={ setup | app | deploy }`,
    );

const parameters = [devParameter, prdParameter];
const appParameter: AppParameter = parameters.filter(
    (obj: AppParameter) => obj.envName === envKey,
)[0];

if (taskKey === 'setup') {
    new SetupStack(app, `${appParameter.envName}SetupStack`, {
        ...appParameter,
    });
} else if (taskKey === 'app') {
    new LaravelAppStack(app, `${appParameter.envName}LaravelAppStack`, {
        ...appParameter,
    });
} else if (taskKey === 'deploy') {
    new DeployStack(app, `${appParameter.envName}LaravelAppStack`, {
        ...appParameter,
    });
}
