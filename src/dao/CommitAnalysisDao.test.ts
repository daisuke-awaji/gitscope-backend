import { DataMapper } from '@aws/dynamodb-data-mapper';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import faker = require('faker');
import { CommitAnalysis } from '../model/CommitAnalysis';
import { CommitAnalysisDao } from './CommitAnalysisDao';

const cleanup = async () => {
  const dynamodb = new DynamoDB({
    region: 'us-east-1',
    endpoint: 'http://localhost:8000',
  }); // the SDK client used to execute operations

  const tables = await dynamodb.listTables().promise();
  for (const table of tables.TableNames) {
    await dynamodb.deleteTable({ TableName: table }).promise();
  }
};

describe('dynamodb data mapper lesson', () => {
  const mapper = new DataMapper({
    client: new DynamoDB({
      region: 'us-east-1',
      endpoint: 'http://localhost:8000',
    }), // the SDK client used to execute operations
    tableNamePrefix: 'dev_', // optionally, you can provide a table prefix to keep your dev and prod tables separate
  });

  beforeEach(async () => {
    await cleanup();
  });

  it('put item', async () => {
    await mapper.createTable(CommitAnalysis, {
      readCapacityUnits: 5,
      writeCapacityUnits: 5,
      //   indexOptions: {
      //     repositoryNameWithOwnerIndex: {
      //       type: 'global',
      //       projection: 'all',
      //       readCapacityUnits: 1,
      //       writeCapacityUnits: 1,
      //     },
      //   },
    });

    const dao = new CommitAnalysisDao(mapper);
    for (let i = 0; i < 5; i++) {
      await dao.save({
        repositoryNameWithOwner: 'daisuke-awaji/sample_app',
        sha: faker.datatype.uuid(),
        state: faker.random.arrayElement(['success', 'error']),
        riskPoint: faker.datatype.number(100),
        leadTime: {
          open: faker.datatype.number(10),
          work: faker.datatype.number(10),
          review: faker.datatype.number(10),
        },
      });
    }

    await dao.save({
      sha: 'a057bf86108c7afbf507cdad82684bb8e2489938',
      repositoryNameWithOwner: 'daisuke-awaji/sample_app',
      state: 'pending',
    });

    await dao.save({
      sha: 'a057bf86108c7afbf507cdad82684bb8e2489938', // 同じ sha のステータスを更新する
      repositoryNameWithOwner: 'daisuke-awaji/sample_app',
      state: 'success',
      riskPoint: 10,
      leadTime: {
        open: 1.2,
        work: 1.3,
        review: 3.1,
      },
    });

    const one = await dao.findOne({
      sha: 'a057bf86108c7afbf507cdad82684bb8e2489938',
      repositoryNameWithOwner: 'daisuke-awaji/sample_app',
    });
    console.log(one);

    const all = await dao.findAllInRepository({
      repositoryNameWithOwner: 'daisuke-awaji/sample_app',
    });
    console.log(all);
  });
});
