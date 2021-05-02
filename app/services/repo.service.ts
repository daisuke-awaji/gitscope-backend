import { createGraphQLClient, GitHubClient, Repository } from "./github";
import { formatJSONResponse } from "../utils/apigateway";

interface RepositoryStatus extends Repository {
  followed: boolean;
}

class RepositoryService {
  async run(token: string): Promise<RepositoryStatus[]> {
    try {
      const gqlClient = createGraphQLClient(token);
      const client = new GitHubClient(gqlClient);
      const result = await client.fetchRepositories();
      return result.map((repo) => ({ followed: false, ...repo }));
    } catch (e) {
      console.log(e);
      throw formatJSONResponse(403, { message: "unauthorized" });
    }
  }
}

export default RepositoryService;
