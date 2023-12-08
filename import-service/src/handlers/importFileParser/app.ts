import { readCSVFileStream } from '../../utils/csv'
import { getS3ReadStream } from '../../utils/s3utils';

import { S3Event } from 'aws-lambda';

export const handler = async (
  event: S3Event
): Promise<any> => {
  try {
    console.log('event', JSON.stringify(event));

    const bucket = event.Records[0].s3.bucket.name;
    const fileName = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    const rawStream = await getS3ReadStream({
      bucket,
      fileName,
    });

    if (!rawStream) {
      console.log('failed to read from s3 bucket')
      return true;
    }
    console.log('got rawStream');

    await readCSVFileStream(
      rawStream,
      bucket,
      fileName,
      fileName.replace('uploaded/', 'parsed/')
    );
    console.log('done');
  } catch (err: any) {
    console.log('err', err);
  }
}