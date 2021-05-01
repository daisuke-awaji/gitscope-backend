import { createGraphQLClient, GitHubClient, Repository } from "../github";

interface RepositoryStatus extends Repository {
  followed: boolean;
}

class RepositoryService {
  async run(token): Promise<RepositoryStatus[]> {
    try {
      const gqlClient = createGraphQLClient(token);
      const client = new GitHubClient(gqlClient);
      const result = await client.fetchRepositories();
      return result.map((repo) => ({ followed: false, ...repo }));
    } catch (e) {
      throw e;
    }
  }
}

export default RepositoryService;
