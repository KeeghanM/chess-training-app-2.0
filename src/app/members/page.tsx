import { prisma } from '@/server/db';

import CalculateXpRank from '../_util/calculate-xp-rank';
import { Container } from '../components/_elements/container';
import { StyledLink } from '../components/_elements/styled-link';
import { PageHeader } from '../components/_layouts/page-header';
import TrophyTile from '../components/members/TrophyTile';

export async function MembersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  const pageNumber = searchParams?.page
    ? parseInt(searchParams.page as string)
    : 1;
  const resultsPerPage = 50;
  const members = await prisma.userProfile.findMany({
    where: {
      lastTrained: {
        not: null,
      },
    },
    skip: (pageNumber - 1) * resultsPerPage,
    take: resultsPerPage,
    orderBy: {
      experience: 'desc',
    },
  });

  const topThree = pageNumber === 1 ? members.slice(0, 3) : [];

  return (
    <>
      <PageHeader
        subTitle="How do you rank among the best?"
        title="Members Leaderboard"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
      />
      <Container>
        {topThree.length > 0 && (
          <div className="flex flex-col gap-4 md:flex-row">
            {topThree.map((member, index) => (
              <TrophyTile
                key={member.id}
                placement={index + 1}
                published={member.public}
                username={member.username}
                xp={member.experience}
              />
            ))}
          </div>
        )}
        <table className="my-6 w-full">
          <tr className="bg-slate-800 text-white">
            <th>Username</th>
            <th>Experience</th>
            <th>Rank</th>
          </tr>
          {members.map((member, index) => {
            const rank = CalculateXpRank(member.experience);
            return (
              <tr
                key={member.id}
                className={`text-center ${index % 2 === 0 ? 'bg-gray-100' : ''}`}
              >
                <td>
                  {member.public ? (
                    <StyledLink href={`/members/${member.username}`}>
                      {member.username}
                    </StyledLink>
                  ) : (
                    member.username
                  )}
                </td>
                <td>{member.experience.toLocaleString('en-GB')}</td>
                <td>
                  <strong>{rank.rank.rank}:</strong> {rank.rank.name}
                </td>
              </tr>
            );
          })}
        </table>

        <div className="flex items-center gap-2">
          {pageNumber > 1 && (
            <StyledLink href={`/members?page=${pageNumber - 1}`}>
              Previous Page
            </StyledLink>
          )}
          {members.length === resultsPerPage && (
            <StyledLink href={`/members?page=${pageNumber + 1}`}>
              Next Page
            </StyledLink>
          )}
        </div>
      </Container>
    </>
  );
}
