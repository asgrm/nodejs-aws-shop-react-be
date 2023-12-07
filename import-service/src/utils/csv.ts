import { Readable } from 'stream';
import csv from 'csv-parser';
import { moveS3Object } from './s3utils';
import { sendSQSMessage } from './sqs';
import { productSchema } from '../schemas/import';

async function* readStream(stream: Readable): AsyncGenerator<any> {
  const iterator = stream[Symbol.asyncIterator]();

  while (true) {
    const { value, done } = await iterator.next();
    if (done) {
      break;
    }
    yield value;
  }
}

export async function readCSVFileStream(stream: Readable, bucket?: string, from?: string, to?: string): Promise<void> {
  const parser = stream.pipe(csv());
  for await (const data of readStream(parser)) {
    const { error } = productSchema.validate(data);
    if (error) {
      console.log('validation error', error);
      continue;
    }
    await sendSQSMessage(process.env.PRODUCT_QUEUE!, data);
  }

  console.log('End of the stream reached');
  if (bucket && from && to) {
    await moveS3Object({ from, to, bucket });
    console.log('file moved');
  }
}
