import Image from 'next/image'

import Heading from '@/app/components/_elements/heading'

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
          fill
          alt={props.image.alt}
          className="object-cover object-center w-full h-full filter grayscale brightness-[.3]"
          src={props.image.src}
        />
      </div>
      <div className="relative px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as="h1" color="text-white">
          {props.title}
        </Heading>
        {props.subTitle ? (
          <Heading as="h2" bold={false} color="text-orange-500">
            {props.subTitle}
          </Heading>
        ) : null}
      </div>
    </div>
  )
}
