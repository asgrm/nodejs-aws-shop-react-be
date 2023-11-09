import { buildResponse } from '../../utils/utils'
import { products } from '../../mocks/data'
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

    const product = products.find(el => el.id === productId);

    if (!product) {
      console.log('no product');
      return buildResponse(404, 'Product not found');
    }

    return buildResponse(200, product);
  } catch (err: any) {
    return buildResponse(200, err.message)
  }
}