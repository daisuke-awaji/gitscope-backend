import { DataMapper } from "@aws/dynamodb-data-mapper";
import DynamoDB = require("aws-sdk/clients/dynamodb");
import { UserRepositorySetting } from "../model/UserRepositorySetting";
import { UserRepositorySettingDao } from "./UserRepositorySettingDao";

const cleanup = async () => {
  const dynamodb = new DynamoDB({
    region: "us-east-1",
    endpoint: "http://localhost:8000",
  }); // the SDK client used to execute operations

  const tables = await dynamodb.listTables().promise();
  for (const table of tables.TableNames) {
    await dynamodb.deleteTable({ TableName: table }).promise();
  }
};

describe("dynamodb data mapper lesson", () => {
  const mapper = new DataMapper({
    client: new DynamoDB({
      region: "us-east-1",
      endpoint: "http://localhost:8000",
    }), // the SDK client used to execute operations
    tableNamePrefix: "dev_", // optionally, you can provide a table prefix to keep your dev and prod tables separate
  });

  beforeEach(async () => {
    await cleanup();
  });

  it("put item", async () => {
    await mapper
      .createTable(UserRepositorySetting, {
        readCapacityUnits: 5,
        writeCapacityUnits: 5,
      })
      .then(() => {
        // the table has been provisioned and is ready for use!
      });

    await mapper.put(
      Object.assign(new UserRepositorySetting(), {
        login: "username",
        repositoryNameWithOwner: "intecrb/sample_app",
        enabled: true,
      })
    );

    await mapper.put(
      Object.assign(new UserRepositorySetting(), {
        repositoryNameWithOwner: "intecrb/sample_app",
        enabled: false,
      })
    );

    for await (const item of mapper.scan(UserRepositorySetting)) {
      // individual items will be yielded as the scan is performed
      console.log(item);
    }
  });
});

describe("UserRepositorySettingDao", () => {
  const mapper = new DataMapper({
    client: new DynamoDB({
      region: "us-east-1",
      endpoint: "http://localhost:8000",
    }), // the SDK client used to execute operations
    tableNamePrefix: "dev_", // optionally, you can provide a table prefix to keep your dev and prod tables separate
  });

  beforeEach(async () => {
    await cleanup();
  });

  it.only("put item", async (done) => {
    await mapper.createTable(UserRepositorySetting, {
      readCapacityUnits: 5,
      writeCapacityUnits: 5,
    });

    const dao = new UserRepositorySettingDao(mapper);
    await dao.save({
      repositoryNameWithOwner: "intecrb/sample_app",
      enabled: true,
    });
    await dao.save({
      repositoryNameWithOwner: "facebook/react",
      enabled: true,
    });
    await dao.save({
      repositoryNameWithOwner: "facebook/react-native",
      enabled: false,
    });
    await dao.save({
      repositoryNameWithOwner: "facebook/react",
      enabled: true,
    });

    const facebookReact = await dao.findByRepositoryWithOwner({
      repositoryNameWithOwner: "facebook/react",
    });
    expect(facebookReact).toMatchObject({
      repositoryNameWithOwner: "facebook/react",
      enabled: true,
    });
    done();
  });
});
