import { Readable } from 'stream';

export type ObjectAny = Record<string | symbol, any>;

export interface S3UploadParams {
  bucketName: string;
  objectKey: string;
  metadata?: ObjectAny;
}

export interface S3ReadStreamParams {
  bucket: string;
  fileName: string;
}

export interface moveS3ObjectParams {
  bucket: string;
  from: string;
  to: string;
}
