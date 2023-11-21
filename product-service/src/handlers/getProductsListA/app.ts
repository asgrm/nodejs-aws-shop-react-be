import { buildResponse } from '../../utils/utils'
import { getAllItems } from '../../db/dynamoDB/utils';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event', event);

    const [products, stocks] = await Promise.all([
      getAllItems(process.env.TABLE_NAME_PRODUCT!),
      getAllItems(process.env.TABLE_NAME_STOCK!)
    ]);

    if (!products || !stocks) {
      return buildResponse(404, { message: 'Products are not found' });
    }

    const res = products.map((product) => {
      const stock = stocks.find((stock) => stock.product_id === product.id);
      return ({
        ...product,
        count: (stock?.count || 0)
      });
    });

    return buildResponse(200, res);
  } catch (err: any) {
    return buildResponse(500, err.message)
  }
}