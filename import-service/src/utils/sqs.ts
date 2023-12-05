import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"; // ES Modules import
import { randomUUID } from 'crypto';

const client = new SQSClient({
  region: process.env.PRODUCT_AWS_REGION || "eu-west-1",
});


export async function sendSQSMessage(
  QueueUrl: string,
  body: any,
  GroupId?: string,
  DeduplicationId?: string,
) {

  const payload = {
    QueueUrl,
    MessageBody: JSON.stringify(body),
    MessageGroupId: GroupId || 'products',
    MessageDeduplicationId: DeduplicationId || randomUUID()
  };
  const command = new SendMessageCommand(payload);
  await client.send(command);
  return true;
}