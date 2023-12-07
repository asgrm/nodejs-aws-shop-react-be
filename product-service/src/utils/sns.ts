import { SNSClient, PublishCommand, MessageAttributeValue } from "@aws-sdk/client-sns";
const client = new SNSClient({
  region: process.env.PRODUCT_AWS_REGION,
});


export async function publishToSNSTopic(
  TopicArn: string,
  Message: string,
  Subject: string,
  MessageAttributes: Record<string, MessageAttributeValue> = {}) {
  const payload = {
    TopicArn,
    Message,
    Subject,
    MessageAttributes,
  };
  const command = new PublishCommand(payload);
  const res = await client.send(command);
  return res;
}