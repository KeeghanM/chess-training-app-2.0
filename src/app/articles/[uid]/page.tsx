import {
  type ContentRelationshipField,
  asText,
  RichTextField,
} from '@prismicio/client';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PrismicRichToHtml } from '@/app/_util/prismic-rich-to-html';
import type { RichTextContent } from '@/app/_util/prismic-rich-to-html';
import { Container } from '@/app/components/_elements/container';
import { Heading } from '@/app/components/_elements/heading';
import { CtaRow } from '@/app/components/_layouts/cta-row';
import { Prismic } from '@/prismicio';

interface Params {
  uid: string;
}

export default async function ArticlesPage({ params }: { params: Params }) {
  const page = await Prismic.getByUID('article', params.uid, {
    fetchLinks: ['author.name', 'author.uid'],
  }).catch(() => notFound());

  const author = page.data.author as ContentRelationshipField & {
    data: { name: string; uid: string };
  };
  const pageTitle = page.data.title as string;
  const introduction = page.data.introduction as RichTextContent[];
  const introContent = introduction[0]
    ? PrismicRichToHtml(introduction[0])
    : null;
  const slices = page.data.slices as {
    primary: { content: RichTextContent[] };
  }[];
  const description = introduction[0]
    ? asText(introduction[0] as unknown as RichTextField)
    : asText(slices[0]?.primary.content as unknown as RichTextField);

  return (
    <>
      <div className="flex w-full items-center justify-center bg-gray-200 py-2">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          <Link
            className="cursor-pointer text-purple-700 hover:underline"
            href="/articles"
          >
            /Articles
          </Link>
          /{pageTitle}
        </p>
      </div>
      <Container>
        <Heading as="h1">{pageTitle}</Heading>
        <div className="mb-4 flex flex-wrap justify-center gap-2 text-xs">
          <div className="flex flex-col items-center border border-gray-300">
            <p className="w-full border-b border-gray-300 px-2 py-1 text-center font-bold">
              Author
            </p>
            <p className="p-1">
              <Link
                className="text-purple-700 underline hover:no-underline"
                href={`/articles/author/${author.data.uid}`}
              >
                {author.data.name}
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-center border border-gray-300">
            <p className="w-full border-b border-gray-300 px-2 py-1 text-center font-bold">
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
        <article className="leading-7">
          {introContent}
          {slices[0]?.primary.content.map((c) => PrismicRichToHtml(c))}
        </article>
        <script
          dangerouslySetInnerHTML={{
            __html: `{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "${pageTitle}",
                    "datePublished": "${new Date(
                      page.first_publication_date,
                    ).toISOString()}",
                    "dateModified": "${new Date(
                      page.last_publication_date,
                    ).toISOString()}",
                    "author": {
                        "@type": "Person",
                        "name": "${author.data.name}"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "ChessTraining.app",
                        "logo": {
                        "@type": "ImageObject",
                        "url": "https://chesstraining.app/_next/image?url=%2Fchesstrainingapplogo.png&w=64&q=75"
                        }
                    },
                    "description": "${description.replaceAll('"', '\\"')}"
                    }
                `,
          }}
          type="application/ld+json"
        />
      </Container>
      <CtaRow
        background="dark"
        title="Ready to Elevate Your Chess Game?"
        cta={{
          text: 'Start Training Now',
          link: '/auth/signin',
        }}
      >
        Take the first step towards becoming a stronger chess player. Explore
        our comprehensive chess training tools, improve your skills, and unlock
        your full chess potential. Whether you&apos;re a beginner or an
        experienced player, ChessTraining.app has the resources to help you
        succeed. Don&apos;t miss out on the opportunity to level up your game.
      </CtaRow>
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const page = await Prismic.getByUID('article', params.uid).catch(() =>
    notFound(),
  );

  return {
    title: page.data.meta_title as string,
    description: page.data.meta_description as string,
  };
}

// export async function generateStaticParams() {
//   const pages = await Prismic.getAllByType('article');

//   return pages.map((page) => {
//     return { uid: page.uid };
//   });
// }
