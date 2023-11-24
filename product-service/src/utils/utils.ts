const defaultHeaders = {
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
}

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