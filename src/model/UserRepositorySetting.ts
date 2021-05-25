import {
  attribute,
  hashKey,
  table,
} from "@aws/dynamodb-data-mapper-annotations";

@table("UserRepositorySetting")
export class UserRepositorySetting {
  @hashKey()
  repositoryNameWithOwner: string;

  @attribute()
  enabled?: boolean;
}
