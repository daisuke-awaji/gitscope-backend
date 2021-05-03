import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "./apigateway";

export const parseBearerToken = (event: APIGatewayProxyEvent) => {
  if (!event.headers.Authorization) {
    throw formatJSONResponse(400, { message: "aurhorization header not set" });
  }

  const token = event.headers.Authorization.split(" ")[1]; // Bearer tokentokentoken
  return token;
};
