import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/server/db';

import Container from '@/app/components/_elements/container';
import Heading from '@/app/components/_elements/heading';
import XpDisplay from '@/app/components/dashboard/XpDisplay';

import CalculateXpRank from '@/app/_util/CalculateXpRank';

export default async function MemberPage({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  const account = await prisma.userProfile.findUnique({
    where: {
      username,
    },
  });
  await prisma.$disconnect();

  if (!account) {
    redirect('/404');
  }

  return (
    <>
      <div className="flex w-full items-center justify-center bg-gray-200 py-2">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link className="text-purple-700 hover:underline" href="/members">
            /Members
          </Link>
          /{username}
        </p>
      </div>
      <Container>
        {account.public ? (
          <div className="flex flex-col gap-2 bg-gray-100 p-2">
            <div className="flex flex-col items-center gap-2 md:flex-row">
              <Heading as="h1">{account.username}</Heading>
              {account.fullName ? (
                <p className="text-sm italic">({account.fullName})</p>
              ) : null}
            </div>
            <div className="w-fit">
              <XpDisplay
                data={CalculateXpRank(account.experience)}
                displayLink={false}
              />
            </div>
            {account.description ? (
              <p className="bg-purple-700 p-2 text-white">
                {account.description}
              </p>
            ) : null}
            {account.highestOTBRating ? (
              <p>
                <span className="font-bold">OTB Rating:</span>{' '}
                {account.highestOTBRating}
              </p>
            ) : null}
            {account.highestOnlineRating ? (
              <p>
                <span className="font-bold">Online Rating:</span>{' '}
                {account.highestOnlineRating}
              </p>
            ) : null}
            {account.puzzleRating ? (
              <p>
                <span className="font-bold">Puzzle Rating:</span>{' '}
                {account.puzzleRating}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="bg-gray-100 p-2">
            <Heading as="h1">{account.username}</Heading>
            <p className="text-gray-600">
              This user has chosen to keep their profile private.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
