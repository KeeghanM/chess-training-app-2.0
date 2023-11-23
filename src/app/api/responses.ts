export const errorResponse = (message: string, status: number) => {
  return new Response(
    JSON.stringify({
      message,
    }),
    {
      status,
      headers: { "content-type": "application/json" },
    },
  );
};

export const successResponse = (message: string, data: any, status: number) => {
  return new Response(
    JSON.stringify({
      message,
      data,
    }),
    {
      status,
      headers: { "content-type": "application/json" },
    },
  );
};
