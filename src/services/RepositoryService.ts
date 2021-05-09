import { createGraphQLClient, GitHubClient } from "./github";
import { Repository } from "../model/Repository";
import createHttpError from "http-errors";

interface RepositoryStatus extends Repository {
  followed: boolean;
}

class RepositoryService {
  async run(token: string): Promise<RepositoryStatus[]> {
    const gqlClient = createGraphQLClient(token);
    const client = new GitHubClient(gqlClient);

    try {
      const result = await client.fetchRepositoriesRelatedToMe();
      return result.map((repo) => ({ followed: false, ...repo }));
    } catch (e) {
      throw new createHttpError.Forbidden(e.toString());
    }
  }
}

export default RepositoryService;
