import { asHTML } from '@prismicio/client'
import type { Content } from '@prismicio/client'
import type { SliceComponentProps } from '@prismicio/react'

/**
 * Props for `BlogContent`.
 */
export type BlogContentProps = SliceComponentProps<Content.BlogContentSlice>

/**
 * Component for "BlogContent" Slices.
 */
const BlogContent = ({ slice }: BlogContentProps): JSX.Element => {
  return (
    <div dangerouslySetInnerHTML={{ __html: asHTML(slice.primary.content) }} />
  )
}

export default BlogContent
