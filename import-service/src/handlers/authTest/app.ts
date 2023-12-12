import { buildResponse } from '../../utils/utils';

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event', event);

    return buildResponse(200, { message: 'test123' });
  } catch (err: any) {
    console.log('err', err);
    return buildResponse(500, err.message)
  }
}