import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
  DynamoDBClient,
  ScanCommand,
  TransactWriteItemsCommand,
  QueryCommand
} from "@aws-sdk/client-dynamodb";
import { Product, Stock, ProductWithStock } from '../../types/index';

const dynamoDb = new DynamoDBClient({
  region: process.env.PRODUCT_AWS_REGION,
});

export async function queryItem(key: string, value: string, TableName: string) {
  const command = new QueryCommand({
    TableName,
    KeyConditionExpression: `${key} = :id`,
    ExpressionAttributeValues: { ":id": { S: value } },
  });
  const res = await dynamoDb.send(command);
  return res.Items?.[0] ? unmarshall(res.Items[0]) : null;
}

export async function getAllItems(tableName: string) {
  const params = {
    TableName: tableName,
  };

  try {
    const res = await dynamoDb.send(new ScanCommand(params));
    if (res.Items) {
      return res.Items.map(el => unmarshall(el));
    }
    console.log(`Items are not found in table ${tableName}`);
    return null;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export async function createProduct(
  product: Product,
  stock: Stock,
  productsTableName: string,
  stocksTableName: string
): Promise<ProductWithStock> {
  const transactItems = [
    {
      Put: {
        TableName: productsTableName,
        Item: marshall(product),
      }
    },
    {
      Put: {
        TableName: stocksTableName,
        Item: marshall(stock),
      }
    }
  ];

  try {
    const command = new TransactWriteItemsCommand({ TransactItems: transactItems });
    await dynamoDb.send(command);
    return ({
      ...product,
      count: stock.count,
    })
  } catch (err) {
    console.log(err);
    throw err;
  }
}