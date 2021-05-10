import {
  attribute,
  hashKey,
  rangeKey,
  table,
} from "@aws/dynamodb-data-mapper-annotations";

@table("UserRepositorySetting")
export class UserRepositorySetting {
  /**
   * github login user
   */
  @hashKey()
  login: string;

  @rangeKey()
  repositoryNameWithOwner: string;

  @attribute()
  enabled?: boolean;
}
