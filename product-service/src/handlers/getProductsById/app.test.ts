import { handler } from "./app";
import { products } from "../../mocks/data";
import { APIGatewayProxyEvent } from "aws-lambda";

const createMockEvent = (productId: string | undefined): APIGatewayProxyEvent => ({
  pathParameters: {
    productId: productId,
  },
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

describe("getProductsById", () => {
  test("Should return a product with a given ID", async () => {
    const mockEvent = createMockEvent(products[0].id);
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual(products[0]);
  });

  test("Should return a 404 error for a nonexistent product ID", async () => {
    const mockEvent = createMockEvent("nonexistent-product-id");
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Product not found");
  });

  test("Should return a 404 error for a missing product ID", async () => {
    const mockEvent = createMockEvent(undefined);
    const response = await handler(mockEvent);

    expect(response.statusCode).toBe(404);
    expect(response.body).toContain("Product not found");
  });
});