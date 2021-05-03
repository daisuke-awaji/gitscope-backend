import { format } from 'date-fns';
import PullRequestService from './PullRequestService';

test('date-fns lesson', () => {
  const day = new Date('2020-06-28T08:08:32Z');
  console.log(day);
  const formatDate = format(day, 'yyyy/MM/dd');
  console.log(formatDate);

  const data = [
    {
      title: 'add home png',
      author: 'daisuke-awaji',
      url: 'https://github.com/cloudformation-perfect-guide/docs/pull/3',
      createdAt: '2020-06-26T11:13:47Z',
      mergedAt: '2020-06-26T14:10:33Z',
      additions: 36,
      deletions: 29,
      authoredDate: '2020-06-28T11:13:04Z',
      leadTimeSeconds: 10649,
      timeToMergeSeconds: 10606,
    },
    {
      title: 'what is infrastructure as code',
      author: 'daisuke-awaji',
      url: 'https://github.com/cloudformation-perfect-guide/docs/pull/2',
      createdAt: '2020-06-28T08:36:42Z',
      mergedAt: '2020-06-28T08:41:13Z',
      additions: 17,
      deletions: 0,
      authoredDate: '2020-06-28T08:36:00Z',
      leadTimeSeconds: 313,
      timeToMergeSeconds: 271,
    },
    {
      title: 'deploy to netlify',
      author: 'daisuke-awaji',
      url: 'https://github.com/cloudformation-perfect-guide/docs/pull/1',
      createdAt: '2020-06-28T08:07:32Z',
      mergedAt: '2020-06-28T08:08:32Z',
      additions: 2,
      deletions: 2,
      authoredDate: '2020-06-28T08:07:06Z',
      leadTimeSeconds: 86,
      timeToMergeSeconds: 60,
    },
  ];

  const a = data.map((item) => format(new Date(item.mergedAt), 'yyyy/MM/dd'));
  console.log(a);
});

test('reduce', () => {
  const arr = ['2020/06/26', '2020/06/28', '2020/06/28'];

  const count: { [key: string]: number } = arr.reduce((prev, current) => {
    prev[current] = (prev[current] || 0) + 1;
    return prev;
  }, {});

  console.log(count);

  let result = [];
  Object.keys(count).map((key) => {
    result.push({
      mergedAt: key,
      count: count[key],
    });
  });
  console.log(result);
});

test('handler', async (done) => {
  const token = process.env.TEST_TOKEN;
  const service = new PullRequestService(token);
  const result = await service.getMergedPullRequestPerDay({
    repositoryNameWithOwner: 'cloudformation-perfect-guide/docs',
    startDateString: '2010-11-11',
    endDateString: '2021-11-11',
  });
  console.log(result);
  done();
});
