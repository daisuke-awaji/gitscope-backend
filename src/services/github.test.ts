import {
  createGraphQLClient,
  GitHubGraphQLClient,
} from './GitHubGrqphQLClient';

test('organizations', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const orgs = await client.fetchOrganizations();
  console.log(orgs);
  done();
});

test('repositories', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const orgs = await client.fetchRepositories({ login: 'intecrb' });
  console.log(orgs);
  done();
});

test('own repositories', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const orgs = await client.fetchRepositoriesRelatedToMe();
  console.log(orgs);
  done();
});

test('all merged pullrequests', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const orgs = await client.fetchAllMergedPullRequests({
    searchQuery: 'repo:cloudformation-perfect-guide/docs',
  });
  console.log(orgs);
  console.log(orgs.length);

  const orgsFilterByDateRange = await client.fetchAllMergedPullRequests({
    searchQuery: 'repo:cloudformation-perfect-guide/docs',
    startDateString: '2020-06-28',
    endDateString: '2020-06-29',
  });
  console.log(orgsFilterByDateRange);
  console.log(orgsFilterByDateRange.length);
  done();
});

test('all merged pullrequests facebook/react', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const prs = await client.fetchAllMergedPullRequests({
    searchQuery: 'repo:facebook/react',
    startDateString: '2021-05-01',
    endDateString: '2021-05-29',
  });
  console.log(prs);
  console.log(prs.length);
  done();
});

test.only('count actiity ratio facebook/react', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubGraphQLClient(gqlClient);
  const prs = await client.fetchAllMergedPullRequests({
    searchQuery: 'repo:facebook/react',
    startDateString: '2021-05-01',
    endDateString: '2021-05-29',
  });
  console.log(prs);
  console.log(prs.length);

  let totalComments = 0;
  let totalCommits = 0;
  for (const pr of prs) {
    totalComments += pr.totalComments;
    totalCommits += pr.totalCommits;
  }

  const issues = await client.fetchAllOpenIssues({
    searchQuery: 'repo:serverless/serverless',
    startDateString: '2021-05-01',
    endDateString: '2021-05-10',
  });
  console.log({
    totalComments,
    totalCommits,
    totalMergedPullRequests: prs.length,
    totalOpenIssues: issues.length,
  });
  done();
});
