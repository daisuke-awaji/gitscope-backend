import { DataMapper } from "@aws/dynamodb-data-mapper";
import { CommitAnalysis } from "../model/CommitAnalysis";
import { client } from "../utils/dynamodb-data-mapper";

type CommitAnalysisFindOneParam = {
  sha: string;
  repositoryNameWithOwner: string;
};

type CommitAnalysisFindAllParam = {
  repositoryNameWithOwner: string;
};

export class CommitAnalysisDao {
  private mapper: DataMapper;
  constructor(mapper?: DataMapper) {
    this.mapper = mapper || client;
  }

  async save(props: CommitAnalysis): Promise<CommitAnalysis> {
    const toSave = Object.assign(new CommitAnalysis(), props);
    const saved = await this.mapper.put(toSave);

    return saved;
  }

  async findOne(props: CommitAnalysisFindOneParam): Promise<CommitAnalysis> {
    const one = await this.mapper.get(
      Object.assign(new CommitAnalysis(), props)
    );

    return one;
  }

  async findAllInRepository(
    props: CommitAnalysisFindAllParam
  ): Promise<CommitAnalysis[]> {
    try {
      const result: CommitAnalysis[] = [];

      for await (const commitAnalysis of this.mapper.query(CommitAnalysis, {
        repositoryNameWithOwner: props.repositoryNameWithOwner,
      })) {
        result.push(commitAnalysis);
      }

      return result.sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    } catch (e) {
      if (e.code === "ResourceNotFoundException") {
        return [];
      }
      throw e;
    }
  }
}
