import Link from 'next/link'

import { prisma } from '~/server/db'

import Button from '~/app/components/_elements/button'
import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import StyledLink from '~/app/components/_elements/styledLink'
import CtaRow from '~/app/components/_layouts/ctaRow'
import Hero from '~/app/components/_layouts/hero'
import ImageRowFull from '~/app/components/_layouts/imageRowFull'
import PageHeader from '~/app/components/_layouts/pageHeader'
import { TextWall } from '~/app/components/_layouts/textWall'

export const metadata = {
  title: 'Curated Chess Tactics Training Sets at ChessTraining.app',
  description:
    'All hand picked by our team of chess experts, our curated chess tactics training sets are designed to help you improve your tactical play in chess. Each set is tailored to your chess rating, and based on the chess tactics and themes that you want to focus on. We will automatically track your time and accuracy across the chess puzzles. This means all the admin work required in the WoodPecker method is taken care of for you - you just focus on solving chess puzzles. Remember, these puzzles should be difficult for you to solve! For best results, break your practice into 30-60 minute sessions once a day. Your first time through a puzzle set should take 1-2 weeks.',
}

export default async function CuratedSetsPage() {
  const sets = await prisma.curatedSet.findMany({
    where: { published: true },
  })
  return (
    <>
      <PageHeader
        title="Curated Chess Tactics Training Sets"
        image={{
          src: '/images/hero.avif',
          alt: 'Wooden chess pieces on a chess board',
        }}
        subTitle="Designed to supercharge your Chess Tactics"
      />
      <TextWall title="What are Curated Sets?" background="light">
        <p>
          Designed to be used with our{' '}
          <StyledLink href="/training/tactics">Tactics Trainer</StyledLink>, our
          curated sets are designed to help you improve your tactical play in
          chess. Rather than randomly generated puzzles, these have been hand
          picked by our team of chess experts.
        </p>
      </TextWall>
      <Container>
        <Heading as="h2">All Available Curated Sets</Heading>
        {sets
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          )
          .map((set) => (
            <div className="flex flex-col gap-0 border border-gray-300  shadow-md bg-[rgba(0,0,0,0.03)]0">
              <div className="px-2 py-1 border-b border-gray-300 font-bold  text-orange-500">
                <Link href={set.slug}>{set.name}</Link>
              </div>
              <p>{set.description}</p>
            </div>
          ))}
      </Container>
    </>
  )
}
