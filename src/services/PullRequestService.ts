import { createGraphQLClient, GitHubClient } from './github';
import { formatJSONResponse } from '../utils/apigateway';
import { format } from 'date-fns';

type MergedPullRequestPerDay = {
  mergedAt: string; // YYYY-MM-DD
  count: number;
};

type GetMergedPullRequestPerDayProps = {
  repositoryNameWithOwner: string;
  startDateString: string;
  endDateString: string;
};

class PullRequestService {
  constructor(public token: string) {}

  async getMergedPullRequestPerDay(
    props: GetMergedPullRequestPerDayProps,
  ): Promise<MergedPullRequestPerDay[]> {
    const { repositoryNameWithOwner, startDateString, endDateString } = props;
    try {
      const gqlClient = createGraphQLClient(this.token);
      const client = new GitHubClient(gqlClient);
      const result = await client.fetchAllMergedPullRequests({
        startDateString,
        endDateString,
        searchQuery: `repo:${repositoryNameWithOwner}`,
      });

      const count: { [day: string]: number } = result
        .map((pr) => format(new Date(pr.mergedAt), 'yyyy/MM/dd'))
        .reduce((prev, current) => {
          prev[current] = (prev[current] || 0) + 1;
          return prev;
        }, {});

      const prPerDays: MergedPullRequestPerDay[] = [];
      Object.keys(count).map((key) => {
        prPerDays.push({
          mergedAt: key,
          count: count[key],
        });
      });
      return prPerDays;
    } catch (e) {
      console.log(e);
      throw formatJSONResponse(403, { message: 'unauthorized' });
    }
  }
}

export default PullRequestService;
