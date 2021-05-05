import { GraphQLClient, gql } from 'graphql-request';
import { Repository } from '../model/Repository';
import { parseISO } from 'date-fns';
import { PullRequest, PullRequestNode } from '../model/PullRequest';
import { Organization } from '../model/Organization';
import { Issue, IssueNode } from '../model/Issue';

type User = {
  id: string;
  avatarUrl: string;
  login: string;
};

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export const createGraphQLClient = (token: string) =>
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

  fetchAllOpenIssues(props: {
    searchQuery: string;
    startDateString?: string;
    endDateString?: string;
  }): Promise<Issue[]> {
    const { searchQuery, startDateString, endDateString } = props;
    const startDate = startDateString
      ? parseISO(startDateString).toISOString()
      : '';
    const endDate = endDateString ? parseISO(endDateString).toISOString() : '';

    let q = `is:issue is:open ${searchQuery}`;
    if (startDate !== '' || endDate !== '') {
      q += ` created:${startDate}..${endDate}`;
    }

    return this.fetchAllIssuesByQuery(q);
  }

  fetchAllMergedPullRequests(props: {
    searchQuery: string;
    startDateString?: string;
    endDateString?: string;
  }): Promise<PullRequest[]> {
    const { searchQuery, startDateString, endDateString } = props;
    const startDate = startDateString
      ? parseISO(startDateString).toISOString()
      : '';
    const endDate = endDateString ? parseISO(endDateString).toISOString() : '';

    let q = `is:pr is:merged ${searchQuery}`;
    if (startDate !== '' || endDate !== '') {
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

  async fetchOrganizations(): Promise<Organization[]> {
    const query = gql`
      query {
        viewer {
          organizations(first: 100) {
            nodes {
              login
              avatarUrl
            }
          }
        }
      }
    `;

    const result = await this.graphQLClient.request<{
      viewer: { organizations: { nodes: Organization[] } };
    }>(query);
    return result.viewer.organizations.nodes;
  }

  async fetchRepositoriesRelatedToMe(): Promise<Repository[]> {
    const orgs = await this.fetchOrganizations();

    const promises = [];
    for (const org of orgs) {
      promises.push(this.fetchRepositories({ login: org.login }));
    }
    promises.push(this.fetchOwnRepositories());
    const result: Repository[][] = await Promise.all(promises);

    return result.flat();
  }

  async fetchOwnRepositories(): Promise<Repository[]> {
    const query = gql`
      query($after: String) {
        viewer {
          login
          repositories(first: 100, after: $after) {
            totalCount
            nodes {
              ... on Repository {
                nameWithOwner
                url
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;
    let after: string | undefined;
    let repos: Repository[] = [];
    while (true) {
      const data = await this.graphQLClient.request(query, { after });
      repos = repos.concat(
        data.viewer.repositories.nodes.map(
          (repo) => new Repository(repo.nameWithOwner, repo.url),
        ),
      );
      if (!data.viewer.repositories.pageInfo.hasNextPage) break;
      after = data.viewer.repositories.pageInfo.endCursor;
    }
    return repos;
  }

  async fetchRepositories({ login }: { login: string }): Promise<Repository[]> {
    const query = gql`
      query($after: String, $login: String!) {
        organization(login: $login) {
          login
          repositories(first: 100, after: $after) {
            totalCount
            nodes {
              ... on Repository {
                nameWithOwner
                url
              }
            }
            pageInfo {
              endCursor
              hasNextPage
            }
          }
        }
      }
    `;

    let after: string | undefined;
    let repos: Repository[] = [];
    while (true) {
      const data = await this.graphQLClient.request(query, { after, login });
      console.log(data);
      repos = repos.concat(
        data.organization.repositories.nodes.map(
          (repo) => new Repository(repo.nameWithOwner, repo.url),
        ),
      );

      if (!data.organization.repositories.pageInfo.hasNextPage) break;

      after = data.organization.repositories.pageInfo.endCursor;
    }

    return repos;
  }

  private async fetchAllPullRequestsByQuery(
    searchQuery: string,
  ): Promise<PullRequest[]> {
    const query = gql`
      query($after: String) {
        search(type: ISSUE, first: 100, query: "${searchQuery}", after: $after) {
            issueCount
            nodes {
            ... on PullRequest {
                number
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
                commits(first:100) {
                  nodes {
                    commit {
                      authoredDate
                    }
                  }
                }
                comments {
                  totalCount
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

    while (true) {
      const data = await this.graphQLClient.request(query, { after });
      prs = prs.concat(
        data.search.nodes.map(
          (p: PullRequestNode) =>
            new PullRequest(
              p.number,
              p.title,
              p.author.login,
              p.url,
              p.createdAt,
              p.mergedAt,
              p.additions,
              p.deletions,
              p.commits.nodes[0].commit.authoredDate,
              p.commits.nodes[p.commits.nodes.length - 1].commit.authoredDate,
              p.comments.totalCount,
              p.commits.nodes.length,
            ),
        ),
      );

      if (!data.search.pageInfo.hasNextPage) break;
      after = data.search.pageInfo.endCursor;
    }

    return prs;
  }

  public async fetchAllIssuesByQuery(searchQuery: string): Promise<Issue[]> {
    const query = gql`
      query($after: String) {
        search(
          type: ISSUE
          first: 10
          query: "${searchQuery}"
          after: $after
        ) {
          issueCount
          nodes {
            ... on Issue {
              number
              title
              author {
                login
              }
              url
              createdAt
              comments {
                totalCount
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
    let issues: Issue[] = [];

    while (true) {
      const data = await this.graphQLClient.request<{
        search: {
          issueCount: number;
          nodes: IssueNode[];
          pageInfo: { endCursor: string; hasNextPage: boolean };
        };
      }>(query, { after });
      issues = issues.concat(
        data.search.nodes.map(
          (i: IssueNode) =>
            new Issue(
              i.number,
              i.title,
              i.author.login,
              i.url,
              i.createdAt,
              i.comments.totalCount,
            ),
        ),
      );

      if (!data.search.pageInfo.hasNextPage) break;
      after = data.search.pageInfo.endCursor;
    }

    return issues;
  }
}
