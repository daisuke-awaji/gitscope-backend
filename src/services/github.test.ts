import { createGraphQLClient, GitHubClient } from './github';

test('organizations', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const orgs = await client.fetchOrganizations();
  console.log(orgs);
  done();
});

test('repositories', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const orgs = await client.fetchRepositories({ login: 'intecrb' });
  console.log(orgs);
  done();
});

test('own repositories', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const orgs = await client.fetchRepositoriesRelatedToMe();
  console.log(orgs);
  done();
});

test('all merged pullrequests', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
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

test.only('all merged pullrequests facebook/react', async (done) => {
  const token = process.env.TEST_TOKEN;
  const gqlClient = createGraphQLClient(token);
  const client = new GitHubClient(gqlClient);
  const prs = await client.fetchAllMergedPullRequests({
    searchQuery: 'repo:facebook/react',
    startDateString: '2021-05-01',
    endDateString: '2021-05-29',
  });
  console.log(prs);
  console.log(prs.length);
  done();
});
