import { APIGatewayProxyEvent } from 'aws-lambda';
import PullRequestService from '../services/PullRequestService';
import { formatJSONResponse } from '../utils/apigateway';
import { parseBearerToken } from '../utils/auth';
import { handleError } from '../utils/middleware';
import { format, sub } from 'date-fns';

const pullRequestsHandler = async (
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
  const param = {
    repositoryNameWithOwner,
    startDateString,
    endDateString,
  };

  const prs = await service.getMergedPullRequests(param);
  return formatJSONResponse(200, { prs });
};

export const main = handleError(pullRequestsHandler);
