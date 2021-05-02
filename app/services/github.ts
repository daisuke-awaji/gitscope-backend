import { GraphQLClient, gql } from "graphql-request";
import { PullRequest } from "../model/PullRequest";
import { parseISO } from "date-fns";

type User = {
  id: string;
  avatarUrl: string;
  login: string;
};

export type Repository = {
  nameWithOwner: string;
  url: string;
};

const GITHUB_GRAPHQL_ENDPOINT =
  process.env.GITHUB_ENDPOINT || "https://api.github.com/graphql";

export const createGraphQLClient = (token) =>
  new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
    headers: {
      authorization: `token ${token}`,
    },
    timeout: 3600_000,
  });

export class GitHubClient {
  private graphQLClient: GraphQLClient;
  constructor(graphQLClient: GraphQLClient) {
    this.graphQLClient = graphQLClient;
  }

  fetchAllMergedPullRequests(
    searchQuery: string,
    startDateString?: string,
    endDateString?: string
  ): Promise<PullRequest[]> {
    const startDate = startDateString
      ? parseISO(startDateString).toISOString()
      : "";
    const endDate = endDateString ? parseISO(endDateString).toISOString() : "";

    let q = `is:pr is:merged ${searchQuery}`;
    if (startDate !== "" || endDate !== "") {
      q += ` merged:${startDate}..${endDate}`;
    }

    return this.fetchAllPullRequestsByQuery(q);
  }

  async fetchLoginUser(): Promise<User> {
    const query = gql`
      query {
        viewer {
          id
          avatarUrl
          login
        }
      }
    `;

    const result = await this.graphQLClient.request<{ viewer: User }>(query);
    return result.viewer;
  }

  async fetchRepositories(): Promise<Repository[]> {
    const query = gql`
      query {
        viewer {
          repositories(first: 100) {
            nodes {
              ... on Repository {
                nameWithOwner
                url
              }
            }
          }
        }
      }
    `;

    const result = await this.graphQLClient.request<{
      viewer: { repositories: { nodes: Repository[] } };
    }>(query);

    return result.viewer.repositories.nodes;
  }

  private async fetchAllPullRequestsByQuery(
    searchQuery: string
  ): Promise<PullRequest[]> {
    const query = gql`
      query($after: String) {
        search(type: ISSUE, first: 100, query: "${searchQuery}", after: $after) {
            issueCount
            nodes {
            ... on PullRequest {
                title
                author {
                login
                }
                url
                createdAt
                mergedAt
                additions
                deletions
                # for lead time
                commits(first:1) { 
                nodes {
                    commit {
                    authoredDate
                    }
                }
                }
            }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
        }
        rateLimit {
            limit
            cost
            remaining
            resetAt
        }
      }
    `;

    let after: string | undefined;
    let prs: PullRequest[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const data = await this.graphQLClient.request(query, { after });
      prs = prs.concat(
        data.search.nodes.map(
          (p: PullRequestNode) =>
            new PullRequest(
              p.title,
              p.author.login,
              p.url,
              p.createdAt,
              p.mergedAt,
              p.additions,
              p.deletions,
              p.commits.nodes[0].commit.authoredDate
            )
        )
      );

      if (!data.search.pageInfo.hasNextPage) break;

      // console.error(JSON.stringify(data, undefined, 2));

      after = data.search.pageInfo.endCursor;
    }

    return prs;
  }
}

interface PullRequestNode {
  title: string;
  author: {
    login: string;
  };
  url: string;
  createdAt: string;
  mergedAt: string;
  additions: number;
  deletions: number;
  commits: {
    nodes: {
      commit: {
        authoredDate: string;
      };
    }[];
  };
}
