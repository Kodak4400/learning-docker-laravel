import type * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
    aws_ec2 as ec2,
    aws_elasticloadbalancingv2 as elbv2,
} from 'aws-cdk-lib';
import { type AppParameter } from '../../bin/parameter';

type AppParameterExcludedEnv = Omit<AppParameter, 'env'>;
export interface AlbConstructProps
    extends cdk.StackProps,
        AppParameterExcludedEnv {
    vpcConstract: cdk.aws_ec2.Vpc;
    ecsService: cdk.aws_ecs.FargateService;
}

export class AlbConstruct extends Construct {
    constructor(scope: Construct, id: string, props: AlbConstructProps) {
        super(scope, id);
        const securityGroup = new ec2.SecurityGroup(
            this,
            `${props.envName}AlbSecurityGroup`,
            {
                vpc: props.vpcConstract,
                securityGroupName: `alb-security-group`,
                allowAllOutbound: true,
            },
        );
        securityGroup.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(80),
            'allow http access from the world',
        );

        const alb = new elbv2.ApplicationLoadBalancer(
            this,
            `${props.envName}Alb`,
            {
                vpc: props.vpcConstract,
                internetFacing: true,
                securityGroup,
            },
        );

        const listener = alb.addListener('http-listener', {
            port: 80,
            open: true,
        });

        const targetGroup = listener.addTargets('LaravelTargetGroup', {
            port: 80,
            targets: [props.ecsService],
        });
    }
}
