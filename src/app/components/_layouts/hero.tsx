import Image from 'next/image'
import Link from 'next/link'

import Button from '~/app/components/_elements/button'
import Heading from '~/app/components/_elements/heading'

interface HeroProps {
  title: string
  cta?: {
    text: string
    link: string
  }
  secondary?: {
    text: string
    link: string
  }
  image: {
    src: string
    alt: string
  }
  children: React.ReactNode
}

export default function Hero(props: HeroProps) {
  return (
    <div className="relative flex min-h-[70vh] flex-col justify-center">
      <div className="absolute inset-0">
        <Image
          fill
          alt={props.image.alt}
          className="object-cover object-center w-full h-full filter grayscale brightness-[.3]"
          src={props.image.src}
        />
      </div>
      <div className="relative flex flex-col gap-4 px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as="h1" color="text-white">
          {props.title}
        </Heading>
        <div className="md:max-w-[50%]">{props.children}</div>
        <div className="flex gap-4">
          {props.cta ? <Link href={props.cta.link}>
              <Button variant="primary">{props.cta.text}</Button>
            </Link> : null}
          {props.secondary ? <Link href={props.secondary.link}>
              <Button variant="secondary">{props.secondary.text}</Button>
            </Link> : null}
        </div>
      </div>
    </div>
  )
}
