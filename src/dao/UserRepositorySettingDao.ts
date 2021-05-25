import { DataMapper } from "@aws/dynamodb-data-mapper";
import { UserRepositorySetting } from "../model/UserRepositorySetting";
import { client } from "../utils/dynamodb-data-mapper";

export class UserRepositorySettingDao {
  private mapper: DataMapper;
  constructor(mapper?: DataMapper) {
    this.mapper = mapper || client;
  }

  async findByRepositoryWithOwner(props: {
    repositoryNameWithOwner: string;
  }): Promise<UserRepositorySetting> {
    const one = await this.mapper
      .get(Object.assign(new UserRepositorySetting(), props))
      .catch((e) => {
        console.log(e);
        // TODO: Error handling for NotFound Exception
        return null;
      });

    return one;
  }

  async save(props: UserRepositorySetting): Promise<UserRepositorySetting> {
    const toSave = Object.assign(new UserRepositorySetting(), props);
    const saved = await this.mapper.put(toSave);

    return saved;
  }
}
