import ComplexityCalculator from "./ComplexityCalculator";
import path from "path";

it("get complexity from glob files", async (done) => {
  const calculator = new ComplexityCalculator();

  const config = {
    target: path.resolve(__dirname, "./**.ts"),
    threshold: 1,
  };
  const result = await calculator.getCollectedComplexityGlobFiles(config);
  console.log(result);
  done();
});
