import { Handler } from "aws-lambda";
import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../api/GitHubGrqphQLClient";
import GitHubAuthService from "../services/GitHubAuthService";
import { formatJSONResponse } from "../utils/apigateway";
import { middify } from "../utils/middify";

export const handler: Handler = async (event: any): Promise<any> => {
  if (!event.queryStringParameters.code) {
    throw formatJSONResponse(400, { message: "code is not set" });
  }

  const code = event.queryStringParameters.code;

  const authService = new GitHubAuthService();
  const auth = await authService.getAccessToken(code as string).catch((e) => {
    throw formatJSONResponse(401, {
      message: "get access token error",
      error: e,
    });
  });

  const gqlClient = createGraphQLClient(auth.access_token);
  const client = new GitHubGraphQLClient(gqlClient);
  const user = await client.fetchLoginUser().catch((e) => {
    throw formatJSONResponse(401, {
      message: "fetch login user error",
      error: e,
    });
  });

  return formatJSONResponse(200, {
    user: { token: auth.access_token, ...auth, ...user },
  });
};

export const main = middify({ handler });
