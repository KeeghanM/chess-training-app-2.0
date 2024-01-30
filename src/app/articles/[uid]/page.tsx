import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import type { ContentRelationshipField } from '@prismicio/client'
import { createClient } from '~/prismicio'

import Container from '~/app/components/_elements/container'
import Heading from '~/app/components/_elements/heading'
import CtaRow from '~/app/components/_layouts/ctaRow'

import { PrismicRichToHtml } from '~/app/_util/PrismicRichToHtml'
import type { RichTextContent } from '~/app/_util/PrismicRichToHtml'

type Params = { uid: string }

export default async function Page({ params }: { params: Params }) {
  const client = createClient()
  const page = await client
    .getByUID('article', params.uid, {
      fetchLinks: ['author.name', 'author.uid'],
    })
    .catch(() => notFound())

  const author = page.data.author as ContentRelationshipField & {
    data: { name: string; uid: string }
  }

  return (
    <>
      <div className="w-full flex items-center justify-center py-2 bg-gray-200">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link
            className="text-purple-700 hover:underline cursor-pointer"
            href="/articles"
          >
            /Articles
          </Link>
          /{page.data.title}
        </p>
      </div>
      <Container>
        <Heading as="h1">{page.data.title}</Heading>
        <div className="flex flex-wrap gap-2 mb-4 justify-center text-xs">
          <div className="flex flex-col items-center border border-gray-300">
            <p className="font-bold py-1 px-2 border-b border-gray-300 w-full text-center">
              Author
            </p>
            <p className="p-1">
              <Link
                href={`/articles/author/${author.data.uid}`}
                className="hover:no-underline text-purple-700 underline"
              >
                {author.data.name}
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-center border border-gray-300">
            <p className="font-bold py-1 px-2 border-b border-gray-300 w-full text-center">
              Published
            </p>
            <p className="p-1">
              {new Date(page.first_publication_date).toLocaleDateString(
                'en-GB',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </p>
          </div>
        </div>
        {page.data.introduction[0] &&
          PrismicRichToHtml(page.data.introduction[0] as RichTextContent)}
        <article className="leading-7">
          {page.data.slices.map((slice) =>
            slice.primary.content.map((c) =>
              PrismicRichToHtml(c as RichTextContent),
            ),
          )}
        </article>
      </Container>
      <CtaRow
        title="Ready to Elevate Your Chess Game?"
        background="dark"
        cta={{
          text: 'Start Training Now',
          link: '/auth/signin',
        }}
      >
        Take the first step towards becoming a stronger chess player. Explore
        our comprehensive chess training tools, improve your skills, and unlock
        your full chess potential. Whether you're a beginner or an experienced
        player, ChessTraining.app has the resources to help you succeed. Don't
        miss out on the opportunity to level up your game. Click 'Start Training
        Now' and embark on your chess improvement journey today.
      </CtaRow>
    </>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const client = createClient()
  const page = await client
    .getByUID('article', params.uid)
    .catch(() => notFound())

  return {
    title: page.data.meta_title ?? page.data.title,
    description: page.data.meta_description ?? '',
  }
}

export async function generateStaticParams() {
  const client = createClient()
  const pages = await client.getAllByType('article')

  return pages.map((page) => {
    return { uid: page.uid }
  })
}
