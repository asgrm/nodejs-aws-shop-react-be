import { handler } from "./app";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as dynamoDBUtils from "../../db/dynamoDB/utils";
import { checkBodyParameters } from '../../utils/utils'

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
  "count"
];


describe("GetAllProductsLambda", () => {
  let getAllItemsSpy: jest.SpyInstance;

  beforeEach(() => {
    getAllItemsSpy = jest.spyOn(dynamoDBUtils, "getAllItems");
  });

  afterEach(() => {
    getAllItemsSpy.mockClear();
  });

  afterAll(() => {
    getAllItemsSpy.mockRestore();
  });

  test("should return all products and their stock information", async () => {
    const mockedProducts = [
      {
        id: "1",
        title: "Product 1",
        description: "Product 1 description",
        price: 100,
      },
      {
        id: "2",
        title: "Product 2",
        description: "Product 2 description",
        price: 200,
      },
    ];

    const mockedStocks = [
      {
        product_id: "1",
        count: 10,
      },
      {
        product_id: "2",
        count: 20,
      },
    ];

    getAllItemsSpy.mockResolvedValueOnce(mockedProducts);
    getAllItemsSpy.mockResolvedValueOnce(mockedStocks);

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(200);
    expect(getAllItemsSpy).toHaveBeenCalledTimes(2);


    const responseBody = JSON.parse(response.body);
    expect(Array.isArray(responseBody)).toBe(true);

    const [firstElem] = responseBody;
    expect(checkBodyParameters(requiredProductParams, firstElem)).toBe(true);

  });

  test("should return an error when products or stocks are not found", async () => {
    getAllItemsSpy.mockResolvedValueOnce(null);
    getAllItemsSpy.mockResolvedValueOnce(null);

    const mockEvent: APIGatewayProxyEvent = createMockEvent();

    const response = await handler(mockEvent);
    expect(response.statusCode).toBe(404);
    expect(getAllItemsSpy).toHaveBeenCalledTimes(2);
  });
});