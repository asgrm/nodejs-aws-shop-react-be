import { handler } from './app';
import { S3Event } from 'aws-lambda';
import { Readable } from 'stream';

import * as csvUtils from '../../utils/csv'
import * as s3Utils from '../../utils/s3utils';

const mockEvent200: S3Event = {
  'Records': [
    {
      'eventVersion': '2.1',
      'eventSource': 'aws:s3',
      'awsRegion': 'mock-region',
      'eventTime': null as any,
      'eventName': 'ObjectCreated:Put',
      'userIdentity': null as any,
      'requestParameters': null as any,
      'responseElements': null as any,
      's3': {
        's3SchemaVersion': '1.0',
        'configurationId': null as any,
        'bucket': {
          'name': 'mock-bucket',
          'ownerIdentity': null as any,
          'arn': null as any
        },
        'object': {
          'key': 'uploaded/MOCK_DATA_H.csv',
          'size': 1,
          'eTag': '',
          'sequencer': ''
        }
      }
    }
  ]
};

const mockStream = new Readable()

jest.mock('../../utils/csv');
jest.mock('../../utils/s3utils');

describe('Import Lambda Function', () => {
  let spyOnReadCSVFileStream: jest.SpyInstance;
  let spyOnGetS3ReadStream: jest.SpyInstance;

  beforeAll(() => {
    spyOnReadCSVFileStream = jest.spyOn(csvUtils, 'readCSVFileStream');
    spyOnGetS3ReadStream = jest.spyOn(s3Utils, 'getS3ReadStream');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should successfully process the S3 object and call readCSVFileStream', async () => {
    spyOnGetS3ReadStream.mockResolvedValue(mockStream);
    spyOnReadCSVFileStream.mockResolvedValue(true);
    await handler(mockEvent200);

    expect(spyOnReadCSVFileStream).toHaveBeenCalledTimes(1);
    expect(spyOnGetS3ReadStream).toHaveBeenCalledTimes(1);
  });
});