import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

export interface VpcConstructProps extends cdk.StackProps {
  envName: string;
}

export class VpcConstruct extends Construct {
  public constract: cdk.aws_ec2.Vpc
  constructor(scope: Construct, id: string, props: VpcConstructProps) {
    super(scope, id);
    const vpc = new ec2.Vpc(this, `${props.envName}Vpc`, {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Ingress',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: 24,
          name: 'Application',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        },
        {
          cidrMask: 28,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        }
      ]
    });
    this.constract = vpc
  }
}
