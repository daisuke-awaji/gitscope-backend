import { createGraphQLClient, GitHubClient } from "./github";
import { Repository } from "../model/Repository";
import createHttpError from "http-errors";
import { UserRepositorySettingDao } from "../dao/UserRepositorySettingDao";

interface RepositoryStatus extends Repository {
  followed: boolean;
}

class RepositoryService {
  async run(token: string): Promise<RepositoryStatus[]> {
    const gqlClient = createGraphQLClient(token);
    const client = new GitHubClient(gqlClient);

    try {
      const result = await client.fetchRepositoriesRelatedToMe();
      const user = await client.fetchLoginUser();

      const dao = new UserRepositorySettingDao();
      const repoSettings = await dao.findByLogin({ login: user.login });

      return result.map((repo) => {
        const one = repoSettings.find(
          (i) => i.repositoryNameWithOwner === repo.nameWithOwner
        );
        if (one) {
          return { followed: one.enabled, ...repo };
        }
        return { followed: false, ...repo };
      });
    } catch (e) {
      throw new createHttpError.Forbidden(e.toString());
    }
  }
}

export default RepositoryService;
