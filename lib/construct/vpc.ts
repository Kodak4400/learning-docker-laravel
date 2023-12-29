import type * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import type { VPCSetting } from '../../bin/parameter';

export interface VpcConstructProps extends cdk.StackProps {
    envName: string;
    vpc: VPCSetting;
}

export class VpcConstruct extends Construct {
    public constract: ec2.Vpc;
    public securityGroup: ec2.SecurityGroup;
    constructor(scope: Construct, id: string, props: VpcConstructProps) {
        super(scope, id);
        const vpc = new ec2.Vpc(this, `${props.envName}Vpc`, props.vpc);
        vpc.addGatewayEndpoint('GetLaravelAppContentBucket', {
            service: ec2.GatewayVpcEndpointAwsService.S3,
        });

        const mySecurityGroupWithoutInlineRules = new ec2.SecurityGroup(
            this,
            `${props.envName}SecurityGroup`,
            {
                securityGroupName: `${props.envName}EcsSecurityGroup`,
                vpc,
                description: 'Allow http & https access.',
                allowAllOutbound: true,
                disableInlineRules: true,
            },
        );
        mySecurityGroupWithoutInlineRules.addIngressRule(
            ec2.Peer.anyIpv4(),
            ec2.Port.tcp(443),
            'allow https access.',
        );

        this.constract = vpc;
        this.securityGroup = mySecurityGroupWithoutInlineRules;
    }
}
