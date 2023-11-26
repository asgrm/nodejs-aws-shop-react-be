import { handler } from './app';
import * as generalUtils from '../../utils/utils';
import * as s3Utils from '../../utils/s3utils';
import { APIGatewayProxyEvent } from 'aws-lambda';

const mockEvent200: APIGatewayProxyEvent = {
  path: '/import',
  pathParameters: null,
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  queryStringParameters: { name: 'MOCK_DATA_H.csv' },
  multiValueQueryStringParameters: null,
  requestContext: {} as any,
  stageVariables: null,
  isBase64Encoded: false,
  resource: 'mock-resource',
}

const mockEvent400A: APIGatewayProxyEvent = {
  path: '/import',
  pathParameters: null,
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  queryStringParameters: { name: 'MOCK_DATA_H.xlsx' },
  multiValueQueryStringParameters: null,
  requestContext: {} as any,
  stageVariables: null,
  isBase64Encoded: false,
  resource: 'mock-resource',
}

const mockEvent400B: APIGatewayProxyEvent = {
  path: '/import',
  pathParameters: null,
  body: null,
  headers: {},
  multiValueHeaders: {},
  httpMethod: 'GET',
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  requestContext: {} as any,
  stageVariables: null,
  isBase64Encoded: false,
  resource: 'mock-resource',
}


jest.mock('../../utils/s3utils');


describe('Import Lambda Function', () => {
  let spyOnBuildResponse: jest.SpyInstance;
  let spyOnGetS3UploadUrl: jest.SpyInstance;

  beforeAll(() => {
    spyOnBuildResponse = jest.spyOn(generalUtils, 'buildResponse');
    spyOnGetS3UploadUrl = jest.spyOn(s3Utils, 'getS3UploadUrl');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return presigned URL when valid CSV file name provided', async () => {
    spyOnGetS3UploadUrl.mockResolvedValue('https://test-upload-url');

    const res = await handler(mockEvent200);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toContain('https://test-upload-url');
    expect(spyOnGetS3UploadUrl).toHaveBeenCalledTimes(1);
    expect(spyOnBuildResponse).toHaveBeenCalledTimes(1);
  });

  it('should return 400 status if invalid CSV file name provided', async () => {
    const res = await handler(mockEvent400A);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toContain('Only csv files are allowed');
    expect(spyOnGetS3UploadUrl).not.toHaveBeenCalled();
    expect(spyOnBuildResponse).toHaveBeenCalledTimes(1);
  });



  it('should return an error when CSV file name provided is not provided', async () => {
    const res = await handler(mockEvent400B);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toContain('required');
    expect(spyOnGetS3UploadUrl).not.toHaveBeenCalled();
    expect(spyOnBuildResponse).toHaveBeenCalledTimes(1);
  });

  it('should handle s3 utils errors gracefully', async () => {
    spyOnGetS3UploadUrl.mockImplementationOnce(() => {
      throw new Error('Test Error');
    });

    const res = await handler(mockEvent200);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toContain('Test Error');
    expect(spyOnBuildResponse).toHaveBeenCalledTimes(1);
  });
});