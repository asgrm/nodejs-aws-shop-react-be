import { handler } from "./app";
import { checkBodyParameters } from '../../utils/utils'
import { APIGatewayProxyEvent } from "aws-lambda";

const createMockEvent = (): APIGatewayProxyEvent => ({
  pathParameters: {},
  body: "",
  headers: {},
  multiValueHeaders: {},
  httpMethod: "GET",
  isBase64Encoded: false,
  path: "/products/123",
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: "mock-resource",
});

const requiredProductParams = [
  "id",
  "title",
  "description",
  "price",
];

describe("getProductsList", () => {
  test("Should return list of products", async () => {
    const mockEvent = createMockEvent();
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    const responseBody = JSON.parse(response.body);
    expect(Array.isArray(responseBody)).toBe(true);
    if (responseBody.length) {
      const [firstElem] = responseBody;
      expect(checkBodyParameters(requiredProductParams, firstElem)).toBe(true);
    }
  });
});