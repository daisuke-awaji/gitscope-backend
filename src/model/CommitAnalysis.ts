import { embed } from "@aws/dynamodb-data-mapper";
import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from "@aws/dynamodb-data-mapper-annotations";

type CommitState = "error" | "failure" | "pending" | "success";

class LeadTime {
  @attribute()
  open: number;

  @attribute()
  work: number;

  @attribute()
  review: number;
}

class FileComplexity {
  @attribute()
  file: string;

  @attribute()
  complexity: number;
}

@table("CommitAnalysis")
export class CommitAnalysis {
  @hashKey()
  repositoryNameWithOwner: string;

  @rangeKey()
  sha: string;

  @attribute()
  state: CommitState;

  @rangeKey({ defaultProvider: () => new Date() })
  createdAt?: Date;

  @attribute({ memberType: embed(FileComplexity) })
  fileCompexities?: Array<FileComplexity>;

  @attribute()
  riskPoint?: number;

  @attribute({ memberType: embed(LeadTime) })
  leadTime?: LeadTime;
}
