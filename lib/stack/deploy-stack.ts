import * as cdk from 'aws-cdk-lib';
import {
    aws_s3 as s3,
    aws_codepipeline as codepipeline,
    aws_codebuild as codebuild,
} from 'aws-cdk-lib';
// import * as path from 'path';
// import * as ecrdeploy from 'cdk-ecr-deployment';
// import { uppercaseFirstCharacter } from '../common';
import type { Construct } from 'constructs';
import type { AppParameter } from '../../bin/parameter';
// import { DockerImageAsset, Platform } from 'aws-cdk-lib/aws-ecr-assets';

interface StackProps extends cdk.StackProps {}
type DeployStackProps = StackProps & AppParameter;

export class DeployStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: DeployStackProps) {
        super(scope, id, props);

        const bucket = new s3.Bucket(this, `${props.envName}SBucket`, {
            bucketName: 'artifactBucket',
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
        });

        const pipeline = new codepipeline.Pipeline(
            this,
            `${props.envName}CodePipeline`,
            {
                crossAccountKeys: false,
                pipelineName: 'sample-pipeline',
                artifactBucket: bucket,
            },
        );
        const project = new codebuild.PipelineProject(
            this,
            `${props.envName}CodeBuild`,
            {
                environment: {
                    buildImage: codebuild.LinuxBuildImage.STANDARD_5_0,
                    computeType: codebuild.ComputeType.SMALL,
                    privileged: true,
                    environmentVariables: {
                        AWS_DEFAULT_REGION: { value: this.region },
                        AWS_ACCOUNT_ID: { value: this.account },
                        CONTAINER_NAME: { value: ecrRepo1.repositoryName },
                        REPOSITORY_URI: { value: ecrRepo1.repositoryUri },
                        ARTIFACT_FILE_NAME: { value: artifactFileName },
                        SOME_SECRET: {
                            type: BuildEnvironmentVariableType.SECRETS_MANAGER,
                            value: 'arn:aws:secretsmanager:ap-northeast-1:12345678910:secret:your-secrets-xxxxxx:SOME_SECRET::',
                        },
                    },
                },
                buildSpec: BuildSpec.fromObject(props.buildSpec),
                vpc: props.vpc,
                role: props.codeBuildRole,
            },
        );
        // // Create Docker Image Asset
        // const dockerImageAsset = new DockerImageAsset(
        //     this,
        //     'DockerImageAsset',
        //     {
        //         directory: path.join(__dirname, '..', '..', 'src'),
        //         buildArgs: {
        //             ARG_ENV: 'aws',
        //         },
        //         platform: Platform.LINUX_AMD64,
        //         file: path.join(
        //             __dirname,
        //             '..',
        //             '..',
        //             'docker',
        //             'php',
        //             'Dockerfile',
        //         ),
        //     },
        // );
        // // Deploy Docker Image to ECR Repository
        // new ecrdeploy.ECRDeployment(this, 'DeployDockerImage', {
        //     src: new ecrdeploy.DockerImageName(dockerImageAsset.imageUri),
        //     dest: new ecrdeploy.DockerImageName(
        //         `${props.env?.account}.dkr.ecr.${props.env?.region}.amazonaws.com/php:1`,
        //     ),
        // });
    }
}
