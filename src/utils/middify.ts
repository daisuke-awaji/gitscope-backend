import middy from "@middy/core";
import inputOutputLogger from "@middy/input-output-logger";
import validator from "@middy/validator";
import httpErrorHandler from "@middy/http-error-handler";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";
// import cors from "@middy/http-cors";

type MiddifyProps = {
  handler: Handler;
  validatorOptions?: {
    inputSchema?: object | any;
    outputSchema?: object | any;
  };
};
export const middify = ({ handler, validatorOptions }: MiddifyProps) => {
  const middifiedHandler = middy(handler)
    .use(httpJsonBodyParser())
    .use(inputOutputLogger())
    .use(httpErrorHandler());
  // .use(
  //   cors({
  //     credentials: true,
  //     origin: process.env.ORIGIN,

  //   })
  // );

  if (validatorOptions?.inputSchema) {
    middifiedHandler.use(
      validator({ inputSchema: validatorOptions.inputSchema })
    );
  }

  return middifiedHandler;
};
