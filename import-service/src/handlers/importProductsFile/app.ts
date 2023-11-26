import { buildResponse } from '../../utils/utils';
import { importSignedUrl } from '../../schemas/import'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult
} from "aws-lambda";
import { getS3UploadUrl } from '../../utils/s3utils';

const bucketName = process.env.IMPORT_BUCKET_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('event', event);

    const { value, error } = importSignedUrl.validate(event.queryStringParameters || {});
    if (error != null) {
      console.log(error.message);
      return buildResponse(
        400,
        { message: error.message },
      );
    }

    const {
      name: fileName
    } = value;

    if (!fileName.endsWith('.csv')) {
      return buildResponse(400, { message: 'Only csv files are allowed' });
    }
    const objectKey = `uploaded/${fileName}`;
    const url = await getS3UploadUrl({ bucketName, objectKey });

    return buildResponse(200, { url });
  } catch (err: any) {
    console.log('err', err);
    return buildResponse(500, err.message)
  }
}