import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { VpcConstruct } from '../construct/vpc';
import { EcsConstruct } from '../construct/ecs';
import { type AppParameter } from '../../bin/parameter';
import { AlbConstruct } from '../construct/alb';

interface StackProps extends cdk.StackProps {}
type LaravelAppStackProps = StackProps & AppParameter;

// https://github.com/dwchiang/laravel-on-aws-ecs-workshops/tree/master/section-01
export class LaravelAppStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: LaravelAppStackProps) {
        super(scope, id, props);

        const vpc = new VpcConstruct(this, `${props.envName}VpcConstruct`, {
            envName: props.envName,
            vpc: props.vpc,
        });

        const ecs = new EcsConstruct(this, `${props.envName}EcsConstruct`, {
            ...props,
            vpcConstract: vpc.constract,
            securityGroup: vpc.securityGroup,
        });

        new AlbConstruct(this, `${props.envName}AlbConstruct`, {
            ...props,
            vpcConstract: vpc.constract,
            ecsService: ecs.service,
        });

        // //---------------------------------------------------------------------------
        // // RDS
        // // const rdsInstance = new rds.DatabaseInstance(this, "RDS", {
        // //   engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.VER_8_0_28, }),
        // //   vpc,
        // //   vpcSubnets: {
        // //     subnetType: ec2.SubnetType.PRIVATE_ISOLATED
        // //   },
        // //   instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        // // });
        // //---------------------------------------------------------------------------
    }
}
