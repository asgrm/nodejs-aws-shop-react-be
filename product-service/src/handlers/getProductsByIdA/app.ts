import { buildResponse } from '../../utils/utils';
import {
  queryItem
} from '../../db/dynamoDB/utils';
import { Stock } from '../../types/index'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event', event);
    const productId = event.pathParameters?.productId;

    if (!productId) {
      console.log('no productId');
      return buildResponse(404, 'Product not found');
    }
    const prd = await queryItem('id', productId, process.env.TABLE_NAME_PRODUCT!);

    if (!prd) {
      console.log('no product');
      return buildResponse(404, { message: 'Product not found' });
    }

    const stock = await queryItem('product_id', productId, process.env.TABLE_NAME_STOCK!) as Stock | null;
    const res = {
      ...prd,
      count: (stock?.count || 0)
    };
    return buildResponse(200, res);
  } catch (err: any) {
    return buildResponse(500, err.message)
  }
}