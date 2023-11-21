import { randomUUID } from 'crypto';
import { Product, Stock } from '../../types/index'
import { buildResponse } from '../../utils/utils';
import {
  createProduct
} from '../../db/dynamoDB/utils';
import { productSchema } from '../../schemas/product';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event', event);


    const body = event.body != null ? JSON.parse(event.body) : {};
    const { value, error } = productSchema.validate(body);
    if (error != null) {
      console.log(error.message);
      return buildResponse(
        400,
        { message: error.message },
      );
    }

    const id = randomUUID();

    const {
      title,
      description,
      price,
      count,
    } = value;

    const product: Product = {
      id,
      title,
      description,
      price,
    };

    const stock: Stock = {
      product_id: id,
      count,
    };

    const resEntity = {
      id,
      title,
      description,
      price,
      count,
    };

    const res = await createProduct(
      product,
      stock,
      process.env.TABLE_NAME_PRODUCT!,
      process.env.TABLE_NAME_STOCK!
    );

    console.log(res);

    return buildResponse(200, resEntity);
  } catch (err: any) {
    return buildResponse(500, err.message)
  }
}