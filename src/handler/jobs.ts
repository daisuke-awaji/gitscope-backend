import { APIGatewayProxyEvent } from "aws-lambda";
import JobsService from "../services/JobsService";
import { formatJSONResponse } from "../utils/apigateway";
import { parseBearerToken } from "../utils/auth";
import { middify } from "../utils/middify";

const jobsHandler = async (event: APIGatewayProxyEvent): Promise<any> => {
  const token = parseBearerToken(event);
  const repositoryNameWithOwner = `${event.pathParameters.repositoryOwner}/${event.pathParameters.repositoryName}`;
  const service = new JobsService(token);
  const commits = await service.getCommitAnalysis({ repositoryNameWithOwner });
  return formatJSONResponse(200, { commits });
};

export const main = middify({ handler: jobsHandler });
