import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';

export interface EcrConstructProps extends cdk.StackProps {
    envName: string;
    bucketName: string;
}

export class S3Construct extends Construct {
    public constract: s3.Bucket;
    constructor(scope: Construct, id: string, props: EcrConstructProps) {
        super(scope, id);

        const bucket = new s3.Bucket(this, `${props.envName}S3Construct`, {
            bucketName: props.bucketName,
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        this.constract = bucket;
    }
}
