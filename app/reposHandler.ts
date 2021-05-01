import { Handler, Context, APIGatewayProxyEvent } from "aws-lambda";
import RepositoryService from "./services/repo.service";
import { formatJSONResponse } from "./utils/apigateway";

export const main: Handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<any> => {
  console.log(event);
  const token = event.headers.Authorization.split(" ")[1]; // Bearer tokentokentoken
  const service = new RepositoryService();
  const repos = await service.run(token);
  return formatJSONResponse({ repos });
};
