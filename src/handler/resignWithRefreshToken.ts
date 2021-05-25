import { Handler } from "aws-lambda";
import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../api/GitHubGrqphQLClient";
import GitHubAuthService from "../services/GitHubAuthService";
import { formatJSONResponse } from "../utils/apigateway";
import { middify } from "../utils/middify";

export const resignWithRefreshTokenHandler: Handler = async (
  event: any
): Promise<any> => {
  if (!event.queryStringParameters.refresh_token) {
    throw formatJSONResponse(400, { message: "refresh_token is not set" });
  }

  const refresh_token = event.queryStringParameters.refresh_token;

  const authService = new GitHubAuthService();
  const auth = await authService
    .getAccessTokenUsingRefreshToken(refresh_token as string)
    .catch((e) => {
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

export const handler = middify({ handler: resignWithRefreshTokenHandler });
