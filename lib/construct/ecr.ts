import * as cdk from 'aws-cdk-lib';
import { uppercaseFirstCharacter } from '../common';
import { Construct } from 'constructs';
import { aws_ecr as ecr } from 'aws-cdk-lib';

export interface EcrConstructProps extends cdk.StackProps {
    envName: string;
    repositoryName: string;
}

export class EcrConstruct extends Construct {
    constructor(scope: Construct, id: string, props: EcrConstructProps) {
        super(scope, id);

        new ecr.Repository(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.repositoryName,
            )}EcrRepository`,
            {
                repositoryName: props.repositoryName,
                autoDeleteImages: true,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            },
        );
    }
}
