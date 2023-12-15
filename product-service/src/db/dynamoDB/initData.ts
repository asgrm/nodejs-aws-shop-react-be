import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import 'dotenv/config';
import { stocks, products } from '../../mocks/data'

const client = new DynamoDBClient({
  region: process.env.PRODUCT_AWS_REGION,
});

const tableNameProducts = "products";
const tableNameStocks = "stocks";


async function fillDynamoDbTable(tableName: string, items: any[]): Promise<void> {
  const transactItems = items.map((item) => ({
    Put: {
      TableName: tableName,
      Item: marshall(item),
    },
  }));

  const command = new TransactWriteItemsCommand({ TransactItems: transactItems });

  try {
    await client.send(command);
    console.log(`Data filled into table: ${tableName}`);
  } catch (error) {
    console.error("Error while filling DynamoDB table", error);
  }
}

(async () => {
  await fillDynamoDbTable(tableNameProducts, products);
  await fillDynamoDbTable(tableNameStocks, stocks);
})();
