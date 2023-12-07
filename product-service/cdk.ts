import * as cdk from "aws-cdk-lib";
import * as apiGateway from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { TableV2 } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import 'dotenv/config';

const BASE_URL = 'products';
const BASE = `/${BASE_URL}`;

const app = new cdk.App();
const stack = new cdk.Stack(app, "ProductServiceStack", {
  env: { region: process.env.PRODUCT_AWS_REGION },
});

const catalogItemsQueue = new sqs.Queue(stack, 'CatalogItemsQueue', {
  queueName: 'catalog-items-queue.fifo',
  fifo: true
});

const createProductTopic = new sns.Topic(stack, 'CreateProductTopic', {
  topicName: 'create-product-topic'
});

new sns.Subscription(stack, 'PrimaryEmailSubscription', {
  endpoint: process.env.PRIMARY_EMAIL || '',
  protocol: sns.SubscriptionProtocol.EMAIL,
  topic: createProductTopic,
  filterPolicy: {
    count: sns.SubscriptionFilter.numericFilter({
      between: { start: 1, stop: 10 },
    })
  }
});

const productsTable = TableV2.fromTableName(stack, 'ProductTable', 'products');
const stocksTable = TableV2.fromTableName(stack, 'stocksTable', 'stocks');

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    TABLE_NAME_PRODUCT: productsTable.tableName,
    TABLE_NAME_STOCK: stocksTable.tableName,
    PRODUCT_TOPIC_ARN: createProductTopic.topicArn
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

const catalogBatchProcess = new NodejsFunction(stack, 'CatalogBatchProcessLambda', {
  ...sharedLambdaProps,
  entry: 'src/handlers/catalogBatchProcess/app.ts',
  functionName: 'catalogBatchProcess',
});

createProductTopic.grantPublish(catalogBatchProcess);

catalogBatchProcess.addEventSource(new SqsEventSource(catalogItemsQueue, {
  batchSize: 5,
}));

productsTable.grantReadData(getProductsList);
stocksTable.grantReadData(getProductsList);

productsTable.grantReadData(getProductsById);
stocksTable.grantReadData(getProductsById);

productsTable.grantWriteData(createProduct);
stocksTable.grantWriteData(createProduct);

productsTable.grantWriteData(catalogBatchProcess);
stocksTable.grantWriteData(catalogBatchProcess);

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

new cdk.CfnOutput(stack, 'QueueArn', {
  value: `queue name: ${catalogItemsQueue.queueName} arn: ${catalogItemsQueue.queueArn}`
});

new cdk.CfnOutput(stack, 'SNSArn', {
  value: `SNS name: ${createProductTopic.topicName} arn: ${createProductTopic.topicArn}`
});