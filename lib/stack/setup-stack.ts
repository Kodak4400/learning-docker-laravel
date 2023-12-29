import * as cdk from 'aws-cdk-lib';
import { uppercaseFirstCharacter } from '../common';
import type { Construct } from 'constructs';
import { EcrConstruct } from '../construct/ecr';
import type { AppParameter } from '../../bin/parameter';
import { S3Construct } from '../construct/s3';
import { aws_ssm as ssm } from 'aws-cdk-lib';

interface StackProps extends cdk.StackProps {}
type SetupStackProps = StackProps & AppParameter;

export class SetupStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: SetupStackProps) {
        super(scope, id, props);

        new EcrConstruct(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.nginx.repositoryName,
            )}EcrConstruct`,
            {
                envName: props.envName,
                repositoryName: props.ecr.nginx.repositoryName,
            },
        );

        new EcrConstruct(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.php.repositoryName,
            )}EcrConstruct`,
            {
                envName: props.envName,
                repositoryName: props.ecr.php.repositoryName,
            },
        );

        const bucket = new S3Construct(this, `${props.envName}S3Construct`, {
            envName: props.envName,
            bucketName: props.s3.bucketName,
        });

        new ssm.StringParameter(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.s3.bucketName,
            )}BucketArnSsmParameter`,
            {
                parameterName: `/${props.envName}/bucketArn/${props.s3.bucketName}`,
                stringValue: bucket.constract.bucketArn,
            },
        );
    }
}
