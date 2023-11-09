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

    return buildResponse(200, products);
  } catch (err: any) {
    return buildResponse(200, err.message)
  }
}