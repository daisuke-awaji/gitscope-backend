import { DataMapper } from "@aws/dynamodb-data-mapper";
import DynamoDB = require("aws-sdk/clients/dynamodb");

const env = process.env.NODE_ENV;

const dynamodbLocal = new DynamoDB({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
}); // the SDK client used to execute operations

const dynamdbClient = new DynamoDB({
  region: "us-east-1",
  httpOptions: {
    timeout: 10000, // デフォルト 120000 ms (2min) は長すぎるので APIGateway タイムアウト 29s に収まる範囲とする
  },
  maxRetries: 10,
  retryDelayOptions: {
    // デフォルト 100ms は長すぎるのでもう少し短い間隔で delay する,
    customBackoff: (retryCount, err) => {
      console.log({ retryCount, err }); // リトライが発生した時だけ無理やりログ出力する
      return exponentialDelay(retryCount);
    },
    // base: 50,
  },
  logger: console,
});

// https://seed.run/blog/how-to-fix-dynamodb-timeouts-in-serverless-application.html
export const client = new DataMapper({
  client: env === "dev" ? dynamodbLocal : dynamdbClient,
  tableNamePrefix: env + "_",
});

/**
 * @param  {number} [retryNumber=0]
 * @return {number} - delay in milliseconds
 */
const exponentialDelay = (retryNumber = 0): number => {
  const delay = Math.pow(2, retryNumber) * 50;
  const jitter = delay * 0.2 * Math.random(); // 0-20% of the delay
  return delay + jitter;
};
