import { embed } from '@aws/dynamodb-data-mapper';
import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from '@aws/dynamodb-data-mapper-annotations';

type CommitState = 'error' | 'failure' | 'pending' | 'success';

class LeadTime {
  @attribute()
  open: number;

  @attribute()
  work: number;

  @attribute()
  review: number;
}

@table('CommitAnalysis')
export class CommitAnalysis {
  @hashKey()
  repositoryNameWithOwner: string;

  @rangeKey()
  sha: string;

  @attribute()
  state: CommitState;

  @attribute()
  riskPoint?: number;

  @attribute({ memberType: embed(LeadTime) })
  leadTime?: LeadTime;
}
