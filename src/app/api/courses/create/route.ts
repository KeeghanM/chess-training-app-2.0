export async function POST(request: Request) {
  const { pgnString } = await request.json();
  console.log(pgnString);

  return new Response(
    JSON.stringify({
      message: "Course Created Successfully",
      data: {
        id: 1,
        name: "Test Course",
        description: "Test Course Description",
        pgnString: pgnString,
        createdAt: "2021-05-02T05:03:00.000Z",
        updatedAt: "2021-05-02T05:03:00.000Z",
        userId: 1,
      },
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}
