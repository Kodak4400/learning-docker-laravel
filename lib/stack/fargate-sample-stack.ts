import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcConstruct } from "../construct/vpc";
import { EcsConstruct } from "../construct/ecs";
import { type AppParameter } from "../../bin/parameter";
import { AlbConstruct } from "../construct/alb";

interface StackProps extends cdk.StackProps {}
type FargateSampleStackProps = StackProps & AppParameter

// https://github.com/dwchiang/laravel-on-aws-ecs-workshops/tree/master/section-01
export class FargateSampleStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: FargateSampleStackProps
  ) {
    super(scope, id, props);

    const vpc = new VpcConstruct(this, `${props.envName}VpcConstruct`, {
      envName: props.envName,
    })

    const ecs = new EcsConstruct(this, `${props.envName}EcsConstruct`, {
      ...props,
      vpc: vpc.constract
    })

    const alb = new AlbConstruct(this, `${props.envName}AlbConstruct`, {
      ...props,
      vpc: vpc.constract,
      ecsService: ecs.service
    })

    //---------------------------------------------------------------------------
    // RDS
    // const rdsInstance = new rds.DatabaseInstance(this, "RDS", {
    //   engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_28, }),
    //   vpc,
    //   vpcSubnets: {
    //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED
    //   },
    //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
    // });
    //---------------------------------------------------------------------------    
  }
}
