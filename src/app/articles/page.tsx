import { asHTML, asText } from '@prismicio/client';
import type {
  ContentRelationshipField,
  RichTextField,
} from '@prismicio/client';
import Link from 'next/link';

import { Prismic } from '@/prismicio';

import { Button } from '../components/_elements/button';
import { Container } from '../components/_elements/container';
import { Heading } from '../components/_elements/heading';

export const metadata = {
  title: 'Read the latest Articles on Chess Improvement',
  description:
    'Discover the latest articles on chess improvement and chess training. Learn how to improve your chess game and become a better chess player.',
};

export default async function ArticlesPage() {
  const articles = (await Prismic.getAllByType('article', {
    fetchLinks: ['author.name', 'author.uid'],
  })) as unknown as {
    id: string;
    uid: string;
    first_publication_date: Date;
    last_publication_date: Date;
    data: {
      author: unknown;
      title: string;
      introduction: RichTextField;
    };
  }[];

  return (
    <>
      <div className="flex w-full items-center justify-center bg-gray-200 py-2">
        <p className="text-xs text-gray-600">
          <Link className="text-purple-700 hover:underline" href="/">
            Home
          </Link>
          /Articles
        </p>
      </div>
      <Container>
        <Heading as="h1">The latest Articles, News, and Blog Posts</Heading>
        <p>
          Read the latest articles on chess improvement and chess training.
          Learn how to improve your chess game and become a better chess player.
        </p>
        {articles
          .sort((a, b) => {
            return (
              new Date(b.first_publication_date).getTime() -
              new Date(a.first_publication_date).getTime()
            );
          })
          .map((article) => {
            const author = article.data.author as ContentRelationshipField & {
              data: { name: string; uid: string };
            };
            return (
              <div
                key={article.id}
                className="mb-4 flex flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)] shadow-md  transition-shadow duration-300 hover:shadow-lg"
              >
                <script
                  dangerouslySetInnerHTML={{
                    __html: `{
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": "${article.data.title}",
                    "datePublished": "${new Date(
                      article.first_publication_date,
                    ).toISOString()}",
                    "dateModified": "${new Date(
                      article.last_publication_date,
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
                    "description": "${asText(article.data.introduction).replaceAll('"', '\\"')}"
                    }
                `,
                  }}
                  type="application/ld+json"
                />
                <div className="border-b border-gray-300 px-2 py-1 font-bold text-orange-500">
                  <Link
                    className="hover:underline"
                    href={`/articles/${article.uid}`}
                  >
                    <h2>{article.data.title}</h2>
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs">
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
                      {new Date(
                        article.first_publication_date,
                      ).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: asHTML(article.data.introduction),
                  }}
                  className="p-2"
                />
                <Link className="mx-auto p-2" href={`/articles/${article.uid}`}>
                  <Button variant="primary">Read More</Button>
                </Link>
              </div>
            );
          })}
      </Container>
    </>
  );
}
