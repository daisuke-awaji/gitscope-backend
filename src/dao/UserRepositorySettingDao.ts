import { DataMapper } from "@aws/dynamodb-data-mapper";
import { UserRepositorySetting } from "../model/UserRepositorySetting";
import { client } from "../utils/dynamodb-data-mapper";

export class UserRepositorySettingDao {
  private mapper: DataMapper;
  constructor(mapper?: DataMapper) {
    this.mapper = mapper || client;
  }

  async findByLogin(props: {
    login: string;
    enabled?: boolean;
  }): Promise<UserRepositorySetting[]> {
    const result: UserRepositorySetting[] = [];

    for await (const item of this.mapper.query(UserRepositorySetting, {
      login: props.login,
    })) {
      result.push(item);
    }

    if (props.enabled !== undefined) {
      return result.filter((item) => item.enabled === props.enabled);
    }

    return result;
  }

  async save(props: UserRepositorySetting): Promise<UserRepositorySetting> {
    const toSave = Object.assign(new UserRepositorySetting(), props);
    const saved = await this.mapper.put(toSave);

    return saved;
  }
}
