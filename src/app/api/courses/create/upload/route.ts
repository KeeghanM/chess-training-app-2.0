import { getServerAuthSession } from "~/server/auth";

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const session = await getServerAuthSession();
  if (!session) {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      },
    );
  }
}
