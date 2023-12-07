import {
  SQSEvent
} from "aws-lambda";
import { createProduct } from '../../db/dynamoDB/utils';
import { recordToDBEntites } from '../../utils/utils';
import { publishToSNSTopic } from '../../utils/sns';

const { TABLE_NAME_PRODUCT, TABLE_NAME_STOCK, PRODUCT_TOPIC_ARN } = process.env;

export const handler = async (
  event: SQSEvent
): Promise<any> => {
  console.log('event', event);
  const { Records = [] } = event;

  for (const record of Records) {

    try {
      const [product, stock] = recordToDBEntites(record);
      const createdProduct = await createProduct(product, stock, TABLE_NAME_PRODUCT!, TABLE_NAME_STOCK!);
      const publishRes = await publishToSNSTopic(
        PRODUCT_TOPIC_ARN!,
        JSON.stringify(createdProduct),
        'New product added to Dynamo DB',
        {
          count: {
            DataType: 'Number',
            StringValue: createdProduct.count.toString()
          }
        },
      );
      console.log('publishRes', publishRes);
    } catch (err) {
      console.log('error', err)
    }
  }

  //explicitly ends lambda, no need to "buildResponse"
  return true;
}