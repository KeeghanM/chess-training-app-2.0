import * as prismic from '@prismicio/client'
import * as prismicNext from '@prismicio/next'

export const repositoryName = 'chess-training-app'
const routes: prismic.ClientConfig['routes'] = [
  {
    type: 'article',
    path: '/articles/:uid',
  },
  {
    type: 'author',
    path: '/articles/author/:uid',
  },
]

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: prismicNext.CreateClientConfig = {}) => {
  const client = prismic.createClient(repositoryName, {
    routes,
    ...config,
  })
  return client
}
