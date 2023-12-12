import * as cdk from "aws-cdk-lib";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3notifications from 'aws-cdk-lib/aws-s3-notifications';
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as sqs from "aws-cdk-lib/aws-sqs";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import 'dotenv/config';

const BASE_URL = 'import';
const BASE = `/${BASE_URL}`;

const app = new cdk.App();
const stack = new cdk.Stack(app, "ImportServiceStack", {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

const productQueue = sqs.Queue.fromQueueArn(stack, 'ProductQueue', process.env.PRODUCT_QUEUE_ARN!);

const basicAuthorizer = lambda.Function.fromFunctionArn(stack, 'basicAuthorizer', process.env.AUTHORIZER_FUNCTION_ARN!);

const authorizer = new HttpLambdaAuthorizer('Authorizer', basicAuthorizer, {
  responseTypes: [HttpLambdaResponseType.IAM]
});

new lambda.CfnPermission(stack, 'MyAuthorizerPermission', {
  action: 'lambda:InvokeFunction',
  functionName: basicAuthorizer.functionName,
  principal: 'apigateway.amazonaws.com',
  sourceAccount: stack.account,
});

const bucket = new s3.Bucket(stack, "ImportBucket", {
  bucketName: "import-bucket-asgrm",
  autoDeleteObjects: true,
  cors: [
    {
      allowedHeaders: ['*'],
      allowedMethods: [
        s3.HttpMethods.PUT,
        s3.HttpMethods.POST,
        s3.HttpMethods.GET,
        s3.HttpMethods.DELETE,
        s3.HttpMethods.HEAD,
      ],
      allowedOrigins: ['*'],
    }
  ],
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  removalPolicy: cdk.RemovalPolicy.DESTROY,
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    IMPORT_BUCKET_NAME: bucket.bucketName,
  },
}

const importProductsFile = new NodejsFunction(stack, 'ImportProductsFileLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/importProductsFile/app.ts',
  functionName: 'importProductsFile',
});

//TODO delete authTest lambda
const authTest = new NodejsFunction(stack, 'AuthTestLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/authTest/app.ts',
  functionName: 'authTest',
});

const importFileParser = new NodejsFunction(stack, 'ImportFileParser Lambda', {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    IMPORT_BUCKET_NAME: bucket.bucketName,
    PRODUCT_QUEUE: productQueue.queueUrl
  },
  entry: 'src/handlers/importFileParser/app.ts',
  functionName: 'importFileParser',
});

productQueue.grantSendMessages(importFileParser);

bucket.grantReadWrite(importProductsFile);
bucket.grantReadWrite(importFileParser);
bucket.grantDelete(importFileParser);

bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3notifications.LambdaDestination(importFileParser), {
  prefix: 'uploaded',
});

const api = new apiGateway.HttpApi(stack, 'ImportApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  }
});

api.addRoutes({
  path: `${BASE}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('ImportProductsFileLambdaIntegration', importProductsFile)
});

//TODO move authorizer to base path
api.addRoutes({
  path: `/tests`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('AuthTestLambdaIntegration', authTest),
  authorizer
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}${BASE_URL}`,
});