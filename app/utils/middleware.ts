import { APIGatewayProxyEvent, Context } from "aws-lambda";

type Handler = (event: APIGatewayProxyEvent, context: Context) => Promise<any>;

export const handleError = (handler: Handler) => async (
  event: APIGatewayProxyEvent,
  context: Context
) => {
  console.log({ event, context });
  try {
    const result = await handler(event, context);
    return result;
  } catch (err) {
    return err;
  }
};
