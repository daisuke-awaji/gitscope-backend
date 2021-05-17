import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "../utils/apigateway";
import { middify } from "../utils/middify";
import createError from "http-errors";
import { UserRepositorySettingDao } from "../dao/UserRepositorySettingDao";
import { parseBearerToken } from "../utils/auth";
import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../services/GitHubGrqphQLClient";

const setUpRepositoryHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof inputSchema
> = async (event): Promise<any> => {
  const token = parseBearerToken(event as any);
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const user = await client.fetchLoginUser().catch((e) => {
    console.log(e);
    throw new createError.Unauthorized();
  });

  const { body } = event;

  const dao = new UserRepositorySettingDao();
  const { repositoryName, repositoryOwner } = event.pathParameters;
  const saved = await dao.save({
    login: user.login,
    repositoryNameWithOwner: repositoryOwner + "/" + repositoryName,
    enabled: body.enabled,
  } as any);

  return formatJSONResponse(200, { userRepositorySetting: saved });
};

const inputSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
      },
      required: ["enabled"],
    },
  },
  required: ["body"],
} as const;

export const main = middify({
  handler: setUpRepositoryHandler,
  validatorOptions: { inputSchema },
});
