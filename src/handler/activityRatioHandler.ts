import { APIGatewayProxyEvent } from 'aws-lambda';
import PullRequestService from '../services/PullRequestService';
import { formatJSONResponse } from '../utils/apigateway';
import { parseBearerToken } from '../utils/auth';
import { handleError } from '../utils/middleware';
import { format, sub } from 'date-fns';
import IssueService from '../services/IssueService';

const activityRatioHandler = async (
  event: APIGatewayProxyEvent,
): Promise<any> => {
  const token = parseBearerToken(event);
  const qs = event.queryStringParameters;

  const pastOneWeek = format(sub(new Date(), { days: 7 }), 'yyyy-MM-dd');
  const today = format(new Date(), 'yyyy-MM-dd');
  const startDateString = qs ? qs.startDateString || pastOneWeek : pastOneWeek;
  const endDateString = qs ? qs.endDateString || today : today;

  const repositoryNameWithOwner = `${event.pathParameters.repositoryOwner}/${event.pathParameters.repositoryName}`;
  const service = new PullRequestService(token);
  const issueService = new IssueService(token);
  const param = {
    repositoryNameWithOwner,
    startDateString,
    endDateString,
  };

  const [prs, issues] = await Promise.all([
    service.getMergedPullRequests(param),
    issueService.getOpenIssues(param),
  ]);

  let totalComments = 0;
  let totalCommits = 0;
  for (const pr of prs) {
    totalComments += pr.totalComments;
    totalCommits += pr.totalCommits;
  }

  return formatJSONResponse(200, {
    activitySummary: {
      totalComments,
      totalCommits,
      totalMergedPullRequests: prs.length,
      totalOpenIssues: issues.length,
    },
  });
};

export const main = handleError(activityRatioHandler);
