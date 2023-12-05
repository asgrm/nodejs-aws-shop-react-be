import { handler } from "./app";
import * as dynamoDBUtils from "../../db/dynamoDB/utils";
import { APIGatewayProxyEvent } from "aws-lambda";


const mockEvent200: APIGatewayProxyEvent = {
  pathParameters: null,
  body: `{"description": "Mock description","price": 1,"title": "Mock title","count": 1}`,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "POST",
  isBase64Encoded: false,
  path: '/products',
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: "mock-resource",
}

const mockEvent400: APIGatewayProxyEvent = {
  pathParameters: null,
  body: `{"description": "Mock description 2"}`,
  headers: {},
  multiValueHeaders: {},
  httpMethod: "POST",
  isBase64Encoded: false,
  path: '/products',
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: "mock-resource",
}

jest.mock("../../db/dynamoDB/utils");

describe("createProduct", () => {

  let createProductSpy: jest.SpyInstance;

  beforeAll(() => {
    createProductSpy = jest.spyOn(dynamoDBUtils, "createProduct");
  });

  afterEach(() => {
    createProductSpy.mockClear();
  });

  afterAll(() => {
    createProductSpy.mockRestore();
  });

  test("should create a product with a valid body", async () => {
    const response = await handler(mockEvent200);
    expect(response.statusCode).toBe(200);
    expect(createProductSpy).toHaveBeenCalled();
  });

  test("should return 404 error with an invalid body", async () => {
    const response = await handler(mockEvent400);
    expect(response.statusCode).toBe(400);
    expect(createProductSpy).not.toHaveBeenCalled();
  });
});