import { Handler } from 'aws-lambda';
import { createJWT } from '../services/createGitHubAppJWT';
import { GitHubRestClient } from '../services/GitHubRestClient';
import { formatJSONResponse } from '../utils/apigateway';
import { middify } from '../utils/middify';
import faker from 'faker';

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

export const handler: Handler = async (event: any): Promise<any> => {
  const xGithubEvent = event.headers['X-GitHub-Event'];
  if (xGithubEvent !== 'push') {
    return formatJSONResponse(200, {
      message: 'X-GitHub-Event is not push. So do nothing to this event.',
    });
  }
  const sha = event.body.after;
  const installationId = event.body.installation.id;
  const repo = event.body.repository.name;
  const owner = event.body.repository.owner.login;

  const jwt = await createJWT(installationId);
  const client = new GitHubRestClient(jwt);

  // TODO: calucutlate xxx for push event.
  await client.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'pending',
    target_url: 'https://gitscope.vercel.app/jobs',
    description: 'Waiting for calculate risk points.',
    context: 'Risk Points',
  });
  await client.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'pending',
    target_url: 'https://gitscope.vercel.app/jobs',
    description: 'Waiting for calculate lead time',
    context: 'Lead Time',
  });
  await sleep(2000);

  await client.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'success',
    target_url: 'https://gitscope.vercel.app/jobs',
    description: `${faker.random.number(100)} / 100`,
    context: 'Risk Points',
  });
  await client.createCommitStatus({
    owner,
    repo,
    sha,
    state: 'success',
    target_url: 'https://gitscope.vercel.app/jobs',
    description: `Open: ${faker.random.number(3)}d, Work: ${faker.random.number(
      3,
    )}d, Review, ${faker.random.number(3)}d`,
    context: 'Lead Time',
  });

  return formatJSONResponse(200, { message: 'ok' });
};

export const main = middify({ handler });
