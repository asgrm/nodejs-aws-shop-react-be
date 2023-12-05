import { Readable } from 'stream';
import csv from 'csv-parser';
import { moveS3Object } from './s3utils';
import { sendSQSMessage } from './sqs';


export async function readCSVFileStream(stream: Readable, bucket?: string, from?: string, to?: string): Promise<void> {
  await new Promise((resolve, reject) => {
    stream
      .pipe(csv())
      .on('data', async (data: any) => {
        console.log(process.env.PRODUCT_QUEUE);
        console.log(data);
        await sendSQSMessage(process.env.PRODUCT_QUEUE!, data);
      })
      .on('end', async () => {
        console.log('End of the stream reached');
        if (bucket && from && to) {
          await moveS3Object({ from, to, bucket });
          console.log('file moved');
        }
        resolve(true);
      })
      .on('error', (error: any) => {
        reject(error);
      });
  });
}
