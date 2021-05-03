import { APIGatewayProxyEvent } from 'aws-lambda';
import RepositoryService from '../services/RepositoryService';
import { formatJSONResponse } from '../utils/apigateway';
import { parseBearerToken } from '../utils/auth';
import { handleError } from '../utils/middleware';

const repos = async (event: APIGatewayProxyEvent): Promise<any> => {
  const token = parseBearerToken(event);
  const service = new RepositoryService();
  const repos = await service.run(token);
  return formatJSONResponse(200, { repos });
};

export const main = handleError(repos);
