import {
  SQSEvent
} from "aws-lambda";

export const handler = async (
  event: SQSEvent
): Promise<any> => {
  console.log('event', event);
  return true;
}