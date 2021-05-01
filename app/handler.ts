import { Handler, Context } from "aws-lambda";
import { createGraphQLClient, GitHubClient } from "./github";
import GitHubAuthService from "./services/auth.service";
import { formatJSONResponse } from "./utils/apigateway";

export const main: Handler = async (
  event: any,
  context: Context
): Promise<any> => {
  console.log(event.queryStringParameters);
  const code = event.queryStringParameters.code;
  const authService = new GitHubAuthService();
  const token = await authService.getAccessToken(code as string);
  console.log(token);
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const user = await client.fetchLoginUser();
  return formatJSONResponse({ user: { token, ...user } });
};
