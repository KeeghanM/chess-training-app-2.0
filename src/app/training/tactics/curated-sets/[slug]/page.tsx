import Link from 'next/link';
import { redirect } from 'next/navigation';

import { prisma } from '@/server/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import * as Sentry from '@sentry/nextjs';

import Container from '@/app/components/_elements/container';
import Heading from '@/app/components/_elements/heading';
import StyledLink from '@/app/components/_elements/styledLink';
import GetCuratedSet from '@/app/components/ecomm/GetCuratedSet';

export default async function CuratedSetPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const session = getKindeServerSession();
  const user = await session.getUser();

  const { set, userSetId } = await (async () => {
    try {
      const set = await prisma.curatedSet.findUnique({
        where: {
          slug,
          published: true,
        },
      });

      if (!set) throw new Error('Set not found');

      const userSet = await prisma.tacticsSet.findFirst({
        where: {
          curatedSetId: set.id,
          userId: user?.id,
          active: true,
        },
      });

      return { set, userSetId: userSet?.id ?? undefined };
    } catch (e) {
      Sentry.captureException(e);
      return { set: undefined, userSetId: undefined };
    }
  })();

  if (!set) {
    redirect('/404');
  }

  return (
    <>
      <div className="flex w-full items-center justify-center bg-gray-200 py-2">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link
            className="cursor-pointer text-purple-700 hover:underline"
            href="/training/tactics"
          >
            /Tactics
          </Link>
          <Link
            className="cursor-pointer text-purple-700 hover:underline"
            href="/training/tactics/curated-sets"
          >
            /Curated Sets
          </Link>
          /{set.name}
        </p>
      </div>
      <Container>
        <div className="flex flex-col gap-2">
          <div className="bg-gray-100 p-4">
            <Heading as="h1">{set.name}</Heading>
            <p className="text-sm">
              Chess puzzles designed to be used with our{' '}
              <StyledLink href="/training/tactics">Tactics Trainer</StyledLink>.
            </p>
            <ul>
              <li>
                <strong>Intended Rating Range:</strong> {set.minRating} -{' '}
                {set.maxRating}
              </li>
              <li>
                <strong>Number of Puzzles:</strong> {set.size}
              </li>
            </ul>
          </div>
          <GetCuratedSet
            showPrice
            price={set.price}
            setId={set.id}
            slug={set.slug}
            userSetId={userSetId}
          />
          {set.description ? (
            <article
              dangerouslySetInnerHTML={{ __html: set.description }}
              className="bg-gray-100 p-4"
            />
          ) : null}
          {set.description ? (
            <div className="bg-gray-100 p-4">
              <Heading as="h2">Ready to go?</Heading>
              <p>Ready to take your game to the next level?</p>
              <GetCuratedSet
                showPrice
                price={set.price}
                setId={set.id}
                slug={set.slug}
                userSetId={userSetId}
              />
            </div>
          ) : null}
        </div>
      </Container>
    </>
  );
}
