import Image from 'next/image'

import Heading from '~/app/components/_elements/heading'

interface PageHeaderProps {
  title: string
  subTitle?: string
  image: {
    src: string
    alt: string
  }
}

export default function PageHeader(props: PageHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          fill={true}
          className="object-cover object-center w-full h-full"
          src={props.image.src}
          alt={props.image.alt}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, #ffe9da 0%, rgba(249,115,22,0.5) 100%)',
          }}
          aria-hidden="true"
        />
      </div>
      <div className="relative px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as={'h1'}>{props.title}</Heading>
        {props.subTitle && <Heading as={'h2'}>{props.subTitle}</Heading>}
      </div>
    </div>
  )
}
