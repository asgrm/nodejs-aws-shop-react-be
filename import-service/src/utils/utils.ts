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


export function getMimeTypeByFileExtension(fileExtension: string): string {
  switch (fileExtension) {
    case 'pdf':
      return 'application/pdf';
    case 'csv':
      return 'text/csv';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'tiff':
      return 'image/tiff';
    case 'png':
      return 'image/png';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'p7s':
      return 'application/pkcs7-signature';
    case 'txt':
    default:
      return 'text/plain';
  }
}


export function csvRecordToDBEntites<T extends object>(record: T): [Product, Stock] {
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
    price,
  };

  const stock: Stock = {
    product_id: id,
    count
  };

  return [product, stock];
}

