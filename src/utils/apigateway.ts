import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

export type JSONResponse = {
  statusCode: number;
  body: string;
};

export const formatJSONResponse = (
  statusCode: number,
  body: Record<string, unknown>
): JSONResponse => {
  return {
    statusCode,
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
