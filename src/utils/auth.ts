import { APIGatewayProxyEvent } from "aws-lambda";
import createHttpError from "http-errors";

export const parseBearerToken = (event: APIGatewayProxyEvent) => {
  if (!event.headers.Authorization) {
    throw new createHttpError.Forbidden(
      JSON.stringify({ message: "There is something wrong with the token" })
    );
  }

  const token = event.headers.Authorization.split(" ")[1]; // Bearer tokentokentoken
  return token;
};
