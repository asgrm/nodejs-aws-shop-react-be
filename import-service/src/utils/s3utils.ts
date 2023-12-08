import { Readable } from 'stream';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getMimeTypeByFileExtension } from './utils';

import { S3UploadParams, S3ReadStreamParams, moveS3ObjectParams } from '../types/index'

const client = new S3Client({
  region: process.env.PRODUCT_AWS_REGION || "eu-west-1",
});

export async function getS3UploadUrl(
  params: S3UploadParams
) {
  const {
    bucketName,
    objectKey,
    metadata = {},
  } = params;
  const payload = {
    Bucket: bucketName,
    Key: objectKey,
    ContentType: getMimeTypeByFileExtension(<string>objectKey.split('.').pop()),
    Metadata: metadata
  };


  const command = new PutObjectCommand(payload);
  const url = await getSignedUrl(client, command, { expiresIn: 15 * 60 });
  return url;
}

export async function getS3ReadStream(
  params: S3ReadStreamParams
) {
  const input = {
    "Bucket": params.bucket,
    "Key": decodeURIComponent(params.fileName),
  }

  const command = new GetObjectCommand(input);

  const response = await client.send(command);

  const readStream = response.Body as Readable;
  return readStream;
}

export async function moveS3Object(params: moveS3ObjectParams) {
  const { bucket, from, to } = params;
  const copyCommand = new CopyObjectCommand({
    Bucket: bucket,
    CopySource: `${bucket}/${from}`,
    Key: to,
  });
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: from,
  });

  await client.send(copyCommand);
  console.log(`File copied to ${to}`);
  await client.send(deleteCommand);
  console.log(`File deleted from ${from}`);
}
