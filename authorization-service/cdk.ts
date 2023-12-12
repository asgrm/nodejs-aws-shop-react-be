import * as cdk from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as dotenv from 'dotenv';
const environment: dotenv.DotenvPopulateInput = {};
dotenv.config({ processEnv: environment })

const app = new cdk.App();
const stack = new cdk.Stack(app, "AuthorizationServiceStack", {
  env: { region: environment.PRODUCT_AWS_REGION! },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment,
}

const basicAuthorizer = new NodejsFunction(stack, 'BasicAuthorizerLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/basicAuthorizer/app.ts',
  functionName: 'basicAuthorizer',
});

new cdk.CfnOutput(stack, 'basicAuthorizerArn', {
  value: `basicAuthorizer name: ${basicAuthorizer.functionName} arn: ${basicAuthorizer.functionArn}`
});