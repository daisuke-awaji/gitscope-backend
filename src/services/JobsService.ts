import { formatJSONResponse } from "../utils/apigateway";
import { CommitAnalysis } from "../model/CommitAnalysis";
import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../api/GitHubGrqphQLClient";
import { CommitAnalysisDao } from "../dao/CommitAnalysisDao";

type GetJobsProps = {
  repositoryNameWithOwner: string;
};

class JobsService {
  constructor(public token: string) {}
  async getCommitAnalysis(props: GetJobsProps): Promise<CommitAnalysis[]> {
    const { repositoryNameWithOwner } = props;
    const owned = await this.ownedThisRepository(repositoryNameWithOwner);
    if (!owned) {
      throw formatJSONResponse(403, { message: "unauthorized" });
    }

    try {
      const dao = new CommitAnalysisDao();
      return await dao.findAllInRepository({
        repositoryNameWithOwner,
      });
    } catch (e) {
      console.log(e);
      throw formatJSONResponse(403, { message: "unauthorized" });
    }
  }

  async ownedThisRepository(repositoryNameWithOwner: string): Promise<boolean> {
    const gqlClient = createGraphQLClient(this.token);
    const client = new GitHubGraphQLClient(gqlClient);
    const repos = await client.fetchRepositoriesRelatedToMe();
    return repos.some((repo) => repo.nameWithOwner === repositoryNameWithOwner);
  }
}

export default JobsService;
