export type JSONResponse = {
  statusCode: number;
  body: string;
};

export const formatJSONResponse = (
  statusCode: number,
  body: Record<string, unknown>
): JSONResponse => {
  return {
    statusCode,
    body: JSON.stringify(body),
  };
};
