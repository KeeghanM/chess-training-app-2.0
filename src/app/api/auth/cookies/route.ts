import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export function GET() {
  const cookiesList = cookies();
  let sessionId = cookiesList.get('sessionId')?.value;
  if (sessionId === undefined) {
    sessionId = uuidv4();
    cookiesList.set('sessionId', sessionId);
  }

  return new Response(JSON.stringify({ sessionId }), {
    headers: {
      'content-type': 'application/json',
      'Set-Cookie': sessionId,
    },
  });
}
