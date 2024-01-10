import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { uppercaseFirstCharacter } from '../common';
import {
    aws_s3 as s3,
    aws_ecs as ecs,
    aws_ecr as ecr,
    aws_iam as iam,
    aws_ssm as ssm,
    aws_logs as logs,
} from 'aws-cdk-lib';
import type { AppParameter } from '../../bin/parameter';

type AppParameterExcludedEnv = Omit<AppParameter, 'env'>;
export interface EcsConstructProps
    extends cdk.StackProps,
        AppParameterExcludedEnv {
    vpcConstract: cdk.aws_ec2.Vpc;
    securityGroup: cdk.aws_ec2.SecurityGroup;
}

export class EcsConstruct extends Construct {
    public service: ecs.FargateService;
    constructor(scope: Construct, id: string, props: EcsConstructProps) {
        super(scope, id);

        const cluster = new ecs.Cluster(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecs.clusterName,
            )}EcsCluster`,
            {
                vpc: props.vpcConstract,
                clusterName: props.ecs.clusterName,
            },
        );

        // Task Definition
        const bucketArn = ssm.StringParameter.fromStringParameterName(
            this,
            `${props.envName}Get${uppercaseFirstCharacter(
                props.s3.bucketName,
            )}BucketArnSsmParameter`,
            `/${props.envName}/bucketArn/${props.s3.bucketName}`,
        );
        const bucket = s3.Bucket.fromBucketAttributes(
            this,
            `${props.envName}Import${uppercaseFirstCharacter(
                props.s3.bucketName,
            )}`,
            {
                bucketArn: bucketArn.stringValue,
            },
        );

        const taskRole = new iam.Role(this, `${props.envName}EcsTaskRole`, {
            assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
            managedPolicies: [
                iam.ManagedPolicy.fromAwsManagedPolicyName(
                    'service-role/AmazonECSTaskExecutionRolePolicy',
                ),
            ],
            inlinePolicies: {
                'get-s3-env': iam.PolicyDocument.fromJson({
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Sid: 'VisualEditor0',
                            Effect: 'Allow',
                            Action: 's3:GetObject',
                            Resource: `${bucketArn.stringValue}/*`,
                        },
                        {
                            Sid: 'VisualEditor1',
                            Effect: 'Allow',
                            Action: 's3:GetBucketLocation',
                            Resource: `${bucketArn.stringValue}`,
                        },
                    ],
                }),
            },
        });

        const fargateTaskDefinition = new ecs.FargateTaskDefinition(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecs.clusterName,
            )}FargateTaskDefinition`,
            {
                family: props.ecs.task.familyName,
                memoryLimitMiB: props.ecs.task.memoryLimitMiB,
                cpu: props.ecs.task.cpu,
                executionRole: taskRole,
                taskRole,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
                    cpuArchitecture: ecs.CpuArchitecture.X86_64,
                },
                ephemeralStorageGiB: 21,
            },
        );

        const nginxRepository = ecr.Repository.fromRepositoryName(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.nginx.repositoryName,
            )}EcrRepository`,
            props.ecr.nginx.repositoryName,
        );

        const phpRepository = ecr.Repository.fromRepositoryName(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.php.repositoryName,
            )}EcrRepository`,
            props.ecr.php.repositoryName,
        );

        const nginxLogGroup = new logs.LogGroup(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.nginx.repositoryName,
            )}LogGroup`,
            {
                logGroupName: `/${props.envName}/ecs/${props.ecr.nginx.repositoryName}`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            },
        );

        const nginxContainer = fargateTaskDefinition.addContainer(
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.nginx.repositoryName,
            )}AddContainer`,
            {
                containerName: 'nginx',
                essential: true,
                image: ecs.ContainerImage.fromEcrRepository(nginxRepository),
                portMappings: props.ecs.task.nginx.portMappings,
                workingDirectory:
                    props.ecs.task.nginx.containerWorkingDirectory,
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: 'nginx',
                    logGroup: nginxLogGroup,
                }),
            },
        );

        const phpLogGroup = new logs.LogGroup(
            this,
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.php.repositoryName,
            )}LogGroup`,
            {
                logGroupName: `/${props.envName}/ecs/${props.ecr.php.repositoryName}`,
                removalPolicy: cdk.RemovalPolicy.DESTROY,
            },
        );

        const containerEnvironmentFiles =
            props.ecs.task.php.containerEnvironmentFiles;
        const envFile =
            containerEnvironmentFiles !== undefined
                ? containerEnvironmentFiles[0]
                : '';
        const phpContainer = fargateTaskDefinition.addContainer(
            `${props.envName}${uppercaseFirstCharacter(
                props.ecr.php.repositoryName,
            )}AddContainer`,
            {
                containerName: 'php',
                essential: true,
                image: ecs.ContainerImage.fromEcrRepository(phpRepository),
                portMappings: props.ecs.task.php.portMappings,
                entryPoint: props.ecs.task.php.entryPoint,
                command: props.ecs.task.php.containerCommand,
                workingDirectory: props.ecs.task.php.containerWorkingDirectory,
                environmentFiles: [
                    ecs.EnvironmentFile.fromBucket(bucket, envFile),
                ],
                logging: ecs.LogDriver.awsLogs({
                    streamPrefix: 'php',
                    logGroup: phpLogGroup,
                }),
            },
        );

        nginxContainer.addVolumesFrom({
            readOnly: false,
            sourceContainer: phpContainer.containerName,
        });

        // Service
        const ecsService = new ecs.FargateService(
            this,
            `${props.envName}${props.ecs.clusterName}FargateService`,
            {
                cluster,
                taskDefinition: fargateTaskDefinition,
                desiredCount: 1,
                vpcSubnets: {
                    subnets: props.vpcConstract.privateSubnets,
                },
                securityGroups: [props.securityGroup],
            },
        );

        this.service = ecsService;
    }
}
