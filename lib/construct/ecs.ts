import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ecs as ecs } from "aws-cdk-lib";
import { aws_ecr as ecr } from "aws-cdk-lib";
import { type AppParameter } from "../../bin/parameter";

export interface StackProps extends cdk.StackProps {
  vpc: cdk.aws_ec2.Vpc
}
type EcsConstructProps = StackProps & AppParameter

export class EcsConstruct extends Construct {
  public service: cdk.aws_ecs.FargateService
  constructor(scope: Construct, id: string, props: EcsConstructProps) {
    super(scope, id);

    const cluster = new ecs.Cluster(this, `${props.envName}${props.ecs.nginx.clusterName}EcsCluster`, {
      vpc: props.vpc,
      clusterName: props.ecs.nginx.clusterName
    })

    // Task Definition
    const fargateTaskDefinition =  new ecs.FargateTaskDefinition(this, `${props.envName}-${props.ecs.nginx.clusterName}FargateTaskDefinition`, {
      family: props.ecs.nginx.taskFamily,
      memoryLimitMiB: props.ecs.nginx.taskMemoryLimitMiB,
      cpu: props.ecs.nginx.taskCpu,
    })

    const ecrRepository = ecr.Repository.fromRepositoryName(this, `${props.envName}${props.ecs.nginx.clusterName}EcrRepository`, props.ecs.nginx.ecrRepositoryName);

    const container = fargateTaskDefinition.addContainer(`${props.envName}${props.ecs.nginx.clusterName}AddContainer`, {
      image: ecs.ContainerImage.fromEcrRepository(ecrRepository), 
      memoryLimitMiB: props.ecs.nginx.containerMemoryLimitMiB,
      cpu: props.ecs.nginx.containerCpu
    })

    container.addPortMappings({
      containerPort: props.ecs.nginx.containerPort,
      protocol: ecs.Protocol.TCP,
    });

    // Service
    const ecsService = new ecs.FargateService(this, `${props.envName}${props.ecs.nginx.clusterName}FargateService`, {
      cluster: cluster,
      taskDefinition: fargateTaskDefinition,
      desiredCount: 1,
    });

    this.service = ecsService
  }
}
