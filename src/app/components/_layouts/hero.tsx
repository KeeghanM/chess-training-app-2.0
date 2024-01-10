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
    <div className="relative flex min-h-[60vh] flex-col justify-center">
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
      <div className="relative flex flex-col gap-4 px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as={'h1'}>{props.title}</Heading>
        <div className="md:max-w-[50%]">{props.children}</div>
        <div className="flex gap-4">
          {props.cta && (
            <Link href={props.cta.link}>
              <Button variant="primary">{props.cta.text}</Button>
            </Link>
          )}
          {props.secondary && (
            <Link href={props.secondary.link}>
              <Button variant="secondary">{props.secondary.text}</Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
