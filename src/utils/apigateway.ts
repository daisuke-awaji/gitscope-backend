export type JSONResponse = {
  statusCode: number;
  headers: any;
  body: string;
};

export const formatJSONResponse = (
  statusCode: number,
  body: Record<string, unknown>,
): JSONResponse => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': process.env.ORIGIN,
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify(body),
  };
};
