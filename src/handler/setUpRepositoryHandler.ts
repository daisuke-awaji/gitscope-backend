import {
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from "../utils/apigateway";
import { middify } from "../utils/middify";
import { UserRepositorySettingDao } from "../dao/UserRepositorySettingDao";
import { parseBearerToken } from "../utils/auth";
import { GitHubRestClient } from "../api/GitHubRestClient";

const setUpRepositoryHandler: ValidatedEventAPIGatewayProxyEvent<
  typeof inputSchema
> = async (event): Promise<any> => {
  const token = parseBearerToken(event as any);
  const { body } = event;

  const dao = new UserRepositorySettingDao();
  const { repositoryName, repositoryOwner } = event.pathParameters;
  const saved = await dao.save({
    repositoryNameWithOwner: repositoryOwner + "/" + repositoryName,
    enabled: body.enabled,
  } as any);

  if (body.enabled && body.config) {
    console.log(body.config);
    const restClient = new GitHubRestClient(token);

    const commit = await restClient
      .GetBranchHead({
        owner: repositoryOwner,
        repo: repositoryName,
        branch: "master",
      })
      .catch((e) => console.log(e));

    const result = await restClient
      .CreateBranch({
        owner: repositoryOwner,
        repo: repositoryName,
        branch: "gitscope-setup",
        sha: commit.object.sha,
      })
      .catch((e) => console.log(e));
    console.log(result);

    await restClient
      .CreateFileContents({
        owner: repositoryOwner,
        repo: repositoryName,
        path: ".gitscope.config.json",
        message: "gitconfig setup",
        content: body.config as string,
        branch: "gitscope-setup",
      })
      .catch((e) => console.log(e));
  }

  return formatJSONResponse(200, { userRepositorySetting: saved });
};

const inputSchema = {
  type: "object",
  properties: {
    body: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        config: { type: "string" },
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
