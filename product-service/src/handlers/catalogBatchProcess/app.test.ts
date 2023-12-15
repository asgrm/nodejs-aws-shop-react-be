import { handler } from "./app";
import * as dynamoDBUtils from "../../db/dynamoDB/utils";
import * as snsUtils from '../../utils/sns';
import { SQSEvent } from "aws-lambda";
import * as utils from '../../utils/utils';

const mockEvent: SQSEvent = {
  Records: [
    {
      messageId: '123',
      receiptHandle: 'totally_valid_receipt_Handle',
      body: '{"title":"totally valid title","description":"absolutelly not fake description","price":"6.9","count":"83","dummy":"totaly_optional_field"}',
      attributes: {} as any,
      messageAttributes: {},
      md5OfBody: '',
      eventSource: 'aws:sqs',
      eventSourceARN: 'test.fifo',
      awsRegion: 'mars-1'
    },
    {
      messageId: 'a2',
      receiptHandle: 'totally_valid_receipt_Handle',
      body: '{"title":"totally valid title 2","description":"a bit fake description","price":"16","count":"8","dummy":"totaly_optional_field"}',
      attributes: {} as any,
      messageAttributes: {},
      md5OfBody: '',
      eventSource: 'aws:sqs',
      eventSourceARN: 'test.fifo',
      awsRegion: 'mars-1'
    }
  ]
};

jest.mock("../../db/dynamoDB/utils");
jest.mock("../../utils/sns");
jest.mock("../../utils/utils");

describe("createProduct", () => {

  let createProductSpy: jest.SpyInstance;
  let publishToSNSTopicSpy: jest.SpyInstance;
  let recordToDBEntitesSpy: jest.SpyInstance;

  beforeAll(() => {
    createProductSpy = jest.spyOn(dynamoDBUtils, "createProduct");
    publishToSNSTopicSpy = jest.spyOn(snsUtils, "publishToSNSTopic");
    recordToDBEntitesSpy = jest.spyOn(utils, "recordToDBEntites");
  });

  afterEach(() => {
    createProductSpy.mockClear();
    publishToSNSTopicSpy.mockClear();
    recordToDBEntitesSpy.mockClear();
  });

  afterAll(() => {
    createProductSpy.mockRestore();
    publishToSNSTopicSpy.mockRestore();
    recordToDBEntitesSpy.mockRestore();
  });

  test("should create a products and publish messages to sns", async () => {

    recordToDBEntitesSpy.mockReturnValue([{}, {}]);
    createProductSpy.mockResolvedValue({ count: 0 });
    publishToSNSTopicSpy.mockResolvedValue({});

    const res = await handler(mockEvent);
    expect(res).toBe(true);
    expect(createProductSpy).toHaveBeenCalledTimes(2);
    expect(publishToSNSTopicSpy).toHaveBeenCalledTimes(2);
    expect(recordToDBEntitesSpy).toHaveBeenCalledTimes(2);
  });

});