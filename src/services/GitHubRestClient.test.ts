import { createJWT } from './createGitHubAppJWT';
import { GitHubRestClient } from './GitHubRestClient';
const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

describe('', () => {
  beforeAll(() => {
    jest.setTimeout(300000);
  });
  test('list commit statuses', async (done) => {
    const token = process.env.TEST_TOKEN;
    const client = new GitHubRestClient(token);
    await client.createCommitStatus({
      owner: 'daisuke-awaji',
      repo: 'gitscope-webhook-test',
      sha: '6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b',
      state: 'pending',
      target_url: 'https://gitscope.vercel.app/jobs',
      description: 'Waiting for calculate risk points.',
      context: 'Risk Points',
    });
    await client.createCommitStatus({
      owner: 'daisuke-awaji',
      repo: 'gitscope-webhook-test',
      sha: '6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b',
      state: 'pending',
      target_url: 'https://gitscope.vercel.app/jobs',
      description: 'Waiting for calculate lead time',
      context: 'Lead Time',
    });
    await sleep(2000);

    await client.createCommitStatus({
      owner: 'daisuke-awaji',
      repo: 'gitscope-webhook-test',
      sha: '6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b',
      state: 'success',
      target_url: 'https://gitscope.vercel.app/jobs',
      description: '88.2 / 100',
      context: 'Risk Points',
    });
    await client.createCommitStatus({
      owner: 'daisuke-awaji',
      repo: 'gitscope-webhook-test',
      sha: '6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b',
      state: 'success',
      target_url: 'https://gitscope.vercel.app/jobs',
      description: 'Open: 2.3d, Work: 1.2d, Review, 0.5d',
      context: 'Lead Time',
    });

    done();
  });

  test.only('create jwt', async (done) => {
    const jwt = await createJWT('16959777');
    console.log(jwt);

    const client = new GitHubRestClient(jwt);
    await client.createCommitStatus({
      owner: 'daisuke-awaji',
      repo: 'gitscope-webhook-test',
      sha: '6d9ed6cdc08b46afc402ba7f11a2508e7d478f7b',
      state: 'pending',
      target_url: 'https://gitscope.vercel.app/jobs',
      description: 'Waiting for calculate risk points.',
      context: 'Risk Points',
    });
    done();
  });
});
