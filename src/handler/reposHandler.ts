import { APIGatewayProxyEvent } from "aws-lambda";
import RepositoryService from "../services/RepositoryService";
import { formatJSONResponse } from "../utils/apigateway";
import { parseBearerToken } from "../utils/auth";
import { middify } from "../utils/middify";

const repos = async (event: APIGatewayProxyEvent): Promise<any> => {
  const token = parseBearerToken(event);
  const service = new RepositoryService();
  const repos = await service.findAllRelatedToMe(token);
  return formatJSONResponse(200, { repos });
};

export const main = middify({ handler: repos });
