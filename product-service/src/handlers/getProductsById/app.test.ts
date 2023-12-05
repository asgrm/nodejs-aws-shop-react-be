import { handler } from "./app";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as dynamoDBUtils from "../../db/dynamoDB/utils";

const createMockEvent = (productId: string | undefined): APIGatewayProxyEvent => ({
  pathParameters: {
    productId: productId,
  },
  body: "",
  headers: {},
  multiValueHeaders: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: `/products/${productId}`,
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: "mock-resource",
});

describe("getProductsById", () => {
  let queryItemSpy: jest.SpyInstance;

  beforeEach(() => {
    queryItemSpy = jest.spyOn(dynamoDBUtils, "queryItem");
  });

  afterEach(() => {
    queryItemSpy.mockClear();
  });

  afterAll(() => {
    queryItemSpy.mockRestore();
  });

  test("should return a product with structure", async () => {
    const testId = '00000000-0000-0000-0000-000000000000'
    const mockedProduct = {
      id: testId,
      title: "mock product",
      description: "mock description",
      price: 100,
    };

    const mockedStock = {
      product_id: testId,
      count: 20
    };

    queryItemSpy.mockResolvedValueOnce(mockedProduct);
    queryItemSpy.mockResolvedValueOnce(mockedStock);

    const mockEvent: APIGatewayProxyEvent = createMockEvent(testId);

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(200);
    expect(queryItemSpy).toHaveBeenCalledTimes(2);
  });

  test("should return 404 error if product was not found", async () => {
    queryItemSpy.mockResolvedValueOnce(null);

    const mockEvent: APIGatewayProxyEvent = createMockEvent('nonexistent-product-id');

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(404);
    expect(queryItemSpy).toHaveBeenCalledTimes(1);
  });

  test("should return 404 error when no id is provided", async () => {
    const mockEvent: APIGatewayProxyEvent = createMockEvent(undefined);

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(404);
    expect(queryItemSpy).not.toHaveBeenCalled();
  });
});