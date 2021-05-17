import * as ts from "typescript";
import {
  IMetricsParseResult,
  MetricsParser,
  MetricsConfiguration,
} from "tsmetrics-core";
import glob from "glob-promise";

type ComplexityCaluculateConfig = {
  target: string;
  threshold: number;
};

type FileComplexity = {
  file: string;
  complexity: number;
};

class ComplexityCalculator {
  public getMetrics(filePath: string): IMetricsParseResult {
    const metricsForFile: IMetricsParseResult = MetricsParser.getMetrics(
      filePath,
      MetricsConfiguration,
      ts.ScriptTarget.ES5
    );
    return metricsForFile;
  }

  getCollectedComplexity(filePath: string): FileComplexity {
    const metric = this.getMetrics(filePath);
    return {
      file: metric.file,
      complexity: metric.metrics.getCollectedComplexity(),
    };
  }

  public async getCollectedComplexityGlobFiles(
    config: ComplexityCaluculateConfig
  ): Promise<FileComplexity[]> {
    const files = await glob.promise(config.target);
    const result = files.map((file) => {
      const fileComplexity = this.getCollectedComplexity(file);
      // if (fileComplexity.complexity >= config.threshold) {
      return fileComplexity;
      // }
    });
    return result;
  }
}

export default ComplexityCalculator;
