import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "../utils/apigateway";
// import { parseBearerToken } from "../utils/auth";
// import { handleError } from "../utils/middleware";
import { middify } from "../utils/middify";
// const createError = require("http-errors");
import createError from "http-errors";

const setUpRepositoryHandler = async (
  event: APIGatewayProxyEvent
): Promise<any> => {
  const { body } = event;

  if (body["enabled"] === true) {
    throw new createError.BadRequest();
  }

  return formatJSONResponse(200, { body });
};

const inputSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
      },
    },
  },
};

export const main = middify({
  handler: setUpRepositoryHandler,
  validatorOptions: { inputSchema },
});
