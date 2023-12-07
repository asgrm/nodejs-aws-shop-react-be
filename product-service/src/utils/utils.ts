import { SQSRecord } from "aws-lambda";
import { Product, Stock } from '../types/index'
// const defaultHeaders = {
//   'Access-Control-Allow-Methods': '*',
//   'Access-Control-Allow-Headers': '*',
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Credentials': true,
// }

export function buildResponse(statusCode: number = 200, body?: any, headers?: object) {
  return ({
    statusCode,
    body: JSON.stringify(body || {}),
    headers: {
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      ...headers
    }
  })
}

export function checkBodyParameters<T extends Record<string | symbol, unknown>>(
  requiredParameters: Array<keyof T>,
  data: T
): boolean {
  return requiredParameters.every((parameter) => {
    const parameterValue = data[parameter];
    if (parameterValue === undefined) {
      return false;
    }
    return true;
  });
}

export function recordToDBEntites(record: SQSRecord): [Product, Stock] {
  const { messageId: id } = record;
  const payload = JSON.parse(record.body);

  const {
    title = '',
    description = '',
    price = 0,
    count = 0
  } = payload;

  const product: Product = {
    id,
    title,
    description,
    price: +price,
  };

  const stock: Stock = {
    product_id: id,
    count: +count
  };

  return [product, stock];
}

