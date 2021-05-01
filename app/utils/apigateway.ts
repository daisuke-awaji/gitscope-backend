export const formatJSONResponse = (response: Record<string, unknown>) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": process.env.ORIGIN,
      "Access-Control-Allow-Credentials": "true",
    },
    body: JSON.stringify(response),
  };
};
