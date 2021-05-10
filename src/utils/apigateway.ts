import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

export type JSONResponse = {
  statusCode: number;
  headers: any;
  body: string;
};

export const formatJSONResponse = (
  statusCode: number,
  body: Record<string, unknown>
): JSONResponse => {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": process.env.ORIGIN,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(body),
  };
};

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;
