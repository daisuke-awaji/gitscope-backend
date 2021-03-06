import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from "../api/GitHubGrqphQLClient";
import { add, format } from "date-fns";
import { PullRequest } from "../model/PullRequest";
import createHttpError from "http-errors";

type MergedPullRequestPerDay = {
  mergedAt: string; // YYYY-MM-DD
  count: number;
};

type GetMergedPullRequestPerDayProps = {
  repositoryNameWithOwner: string;
  startDateString: string;
  endDateString: string;
};

type GetPullRequestProps = {
  repositoryNameWithOwner: string;
  pullRequestId: number;
};

type GetPullRequestByShaProps = {
  repositoryNameWithOwner: string;
  sha: string;
};

class PullRequestService {
  constructor(public token: string) {}

  async getMergedPullRequests(
    props: GetMergedPullRequestPerDayProps
  ): Promise<PullRequest[]> {
    const { repositoryNameWithOwner, startDateString, endDateString } = props;
    try {
      const gqlClient = createGraphQLClient(this.token);
      const client = new GitHubGraphQLClient(gqlClient);
      const result = await client.fetchAllMergedPullRequests({
        startDateString,
        endDateString,
        searchQuery: `repo:${repositoryNameWithOwner}`,
      });

      return result;
    } catch (e) {
      console.log(e);
      throw new createHttpError.Forbidden(e);
    }
  }

  async getPullRequest(props: GetPullRequestProps): Promise<PullRequest> {
    const { repositoryNameWithOwner, pullRequestId } = props;
    try {
      const gqlClient = createGraphQLClient(this.token);
      const client = new GitHubGraphQLClient(gqlClient);
      const pr = await client.fetchPullRequest({
        owner: repositoryNameWithOwner.split("/")[0],
        repo: repositoryNameWithOwner.split("/")[1],
        pullRequestId,
      });

      return pr;
    } catch (e) {
      console.log(e);
      throw new createHttpError.Forbidden(e);
    }
  }

  async getPullRequestsBySha(
    props: GetPullRequestByShaProps
  ): Promise<PullRequest[]> {
    const { repositoryNameWithOwner, sha } = props;
    try {
      const gqlClient = createGraphQLClient(this.token);
      const client = new GitHubGraphQLClient(gqlClient);
      const result = await client.fetchAllPullRequestsByQuery(
        `is:pr repo:${repositoryNameWithOwner} ${sha}`
      );

      return result;
    } catch (e) {
      console.log(e);
      throw new createHttpError.Forbidden(e);
    }
  }

  async getMergedPullRequestPerDay(
    props: GetMergedPullRequestPerDayProps
  ): Promise<MergedPullRequestPerDay[]> {
    const { startDateString, endDateString } = props;
    try {
      const result = await this.getMergedPullRequests(props);

      const count: { [day: string]: number } = result
        .map((pr) => format(new Date(pr.mergedAt), "yyyy-MM-dd"))
        .reduce((prev, current) => {
          prev[current] = (prev[current] || 0) + 1;
          return prev;
        }, {});

      let counter = new Date(startDateString);
      const prPerDays: MergedPullRequestPerDay[] = [];
      while (counter < new Date(endDateString)) {
        const oneDay = format(counter, "yyyy-MM-dd");
        if (count.hasOwnProperty(oneDay)) {
          prPerDays.push({ mergedAt: oneDay, count: count[oneDay] });
        } else {
          prPerDays.push({ mergedAt: oneDay, count: 0 });
        }
        counter = add(counter, { days: 1 });
      }
      return prPerDays;
    } catch (e) {
      console.log(e);
      throw new createHttpError.Forbidden(e);
    }
  }
}

export default PullRequestService;
