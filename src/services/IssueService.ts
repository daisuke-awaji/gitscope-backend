import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from './GitHubGrqphQLClient';
import { formatJSONResponse } from '../utils/apigateway';
import { Issue } from '../model/Issue';

type GetOpenIssuesProps = {
  repositoryNameWithOwner: string;
  startDateString: string;
  endDateString: string;
};

class IssueService {
  constructor(public token: string) {}

  async getOpenIssues(props: GetOpenIssuesProps): Promise<Issue[]> {
    const { repositoryNameWithOwner, startDateString, endDateString } = props;
    try {
      const gqlClient = createGraphQLClient(this.token);
      const client = new GitHubGraphQLClient(gqlClient);
      const result = await client.fetchAllOpenIssues({
        startDateString,
        endDateString,
        searchQuery: `repo:${repositoryNameWithOwner}`,
      });

      return result;
    } catch (e) {
      console.log(e);
      throw formatJSONResponse(403, { message: 'unauthorized' });
    }
  }
}

export default IssueService;
