import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../api/GitHubGrqphQLClient";
import { Repository } from "../model/Repository";
import createHttpError from "http-errors";
import { UserRepositorySettingDao } from "../dao/UserRepositorySettingDao";

interface RepositoryStatus extends Repository {
  followed: boolean;
}

class RepositoryService {
  async findAllRelatedToMe(
    token: string,
    followed?: boolean
  ): Promise<RepositoryStatus[]> {
    const gqlClient = createGraphQLClient(token);
    const client = new GitHubGraphQLClient(gqlClient);

    try {
      const dao = new UserRepositorySettingDao();

      const result = await client.fetchRepositoriesRelatedToMe();
      const followedRepositories = await Promise.all(
        result.map(async (repository) => {
          const followedRepository = await dao.findByRepositoryWithOwner({
            repositoryNameWithOwner: repository.nameWithOwner,
          });
          if (!followedRepository) {
            return { followed: false, ...repository };
          }

          return { followed: followedRepository.enabled, ...repository };
        })
      );

      return followedRepositories.filter((item) => {
        if (followed !== undefined) {
          return item.followed === followed;
        }
        return true;
      });
    } catch (e) {
      throw new createHttpError.Forbidden(e.toString());
    }
  }
}

export default RepositoryService;
