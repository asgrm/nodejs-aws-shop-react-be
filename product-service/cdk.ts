import * as cdk from "aws-cdk-lib";
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import 'dotenv/config';

const BASE = '/products';

const app = new cdk.App();
const stack = new cdk.Stack(app, "ProductServiceStack", {
  env: { region: "eu-west-1" },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  }
}

const getProductsList = new NodejsFunction(stack, 'GetProductsListLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/getProductsList/app.ts',
  functionName: 'getProductsList',
});

const getProductsById = new NodejsFunction(stack, 'GetProductsByIdLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/getProductsById/app.ts',
  functionName: 'getProductsById',
});

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  },
});

api.addRoutes({
  path: BASE,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('GetProductsListLambdaIntegration', getProductsList)
});

api.addRoutes({
  path: `${BASE}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],

  integration: new HttpLambdaIntegration('GetProductsByIdIntegration', getProductsById),
});



new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}${BASE}`,
});