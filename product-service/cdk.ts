import * as cdk from "aws-cdk-lib";
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import 'dotenv/config';

const BASE_URL = 'products';
const BASE = `/${BASE_URL}`;

const app = new cdk.App();
const stack = new cdk.Stack(app, "ProductServiceStack", {
  env: { region: process.env.PRODUCT_AWS_REGION || "eu-west-1" },
});

const productsTable = TableV2.fromTableName(stack, 'ProductTable', 'products');
const stocksTable = TableV2.fromTableName(stack, 'stocksTable', 'stocks');

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PG_HOST: process.env.PG_HOST || '',
    PG_PORT: process.env.PG_PORT || '5432',
    PG_DATABASE: process.env.PGPG_DATABASE || '',
    PG_USERNAME: process.env.PG_USERNAME || '',
    PG_PASSWORD: process.env.PG_PASSWORD || '',
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    TABLE_NAME_PRODUCT: productsTable.tableName,
    TABLE_NAME_STOCK: stocksTable.tableName,
  },
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

const createProduct = new NodejsFunction(stack, 'CreateProductLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/createProduct/app.ts',
  functionName: 'createProduct',
});

productsTable.grantReadData(getProductsList);
stocksTable.grantReadData(getProductsList);

productsTable.grantReadData(getProductsById);
stocksTable.grantReadData(getProductsById);

productsTable.grantWriteData(createProduct);
stocksTable.grantWriteData(createProduct);

const api = new apiGateway.HttpApi(stack, 'ProductApi', {
  corsPreflight: {
    allowHeaders: ['*'],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
    allowOrigins: ['*'],
  },
});

api.addRoutes({
  path: `${BASE}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('GetProductsListLambdaIntegration', getProductsList)
});

api.addRoutes({
  path: `${BASE}/{productId}`,
  methods: [apiGateway.HttpMethod.GET],
  integration: new HttpLambdaIntegration('GetProductsByIdIntegration', getProductsById),
});

api.addRoutes({
  path: BASE,
  methods: [apiGateway.HttpMethod.POST],
  integration: new HttpLambdaIntegration('CreateProductLambdaIntegration', createProduct)
});

new cdk.CfnOutput(stack, 'ApiUrl', {
  value: `${api.url}${BASE_URL}`,
});