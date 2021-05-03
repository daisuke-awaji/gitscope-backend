import { Handler } from 'aws-lambda';
import { createGraphQLClient, GitHubClient } from '../services/github';
import GitHubAuthService from '../services/GitHubAuthService';
import { formatJSONResponse } from '../utils/apigateway';

export const main: Handler = async (event: any): Promise<any> => {
  if (!event.queryStringParameters.code) {
    throw formatJSONResponse(400, { message: 'code is not set' });
  }

  const code = event.queryStringParameters.code;

  const authService = new GitHubAuthService();
  const token = await authService.getAccessToken(code as string).catch((e) => {
    throw formatJSONResponse(401, {
      message: 'get access token error',
      error: e,
    });
  });

  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const user = await client.fetchLoginUser().catch((e) => {
    throw formatJSONResponse(401, {
      message: 'fetch login user error',
      error: e,
    });
  });

  return formatJSONResponse(200, { user: { token, ...user } });
};
