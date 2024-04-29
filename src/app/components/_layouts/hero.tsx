import Image from 'next/image';
import Link from 'next/link';

import Button from '@/app/components/_elements/button';
import Heading from '@/app/components/_elements/heading';

interface HeroProps {
  title: string;
  cta?: {
    text: string;
    link: string;
  };
  secondary?: {
    text: string;
    link: string;
  };
  image: {
    src: string;
    alt: string;
  };
  children: React.ReactNode;
}

export function Hero({ title, cta, secondary, image, children }: HeroProps) {
  return (
    <div className="relative flex min-h-[70vh] flex-col justify-center">
      <div className="absolute inset-0">
        <Image
          fill
          alt={image.alt}
          className="h-full w-full object-cover object-center brightness-[.3] grayscale filter"
          src={image.src}
        />
      </div>
      <div className="relative flex flex-col gap-4 px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as="h1" color="text-white">
          {title}
        </Heading>
        <div className="md:max-w-[50%]">{children}</div>
        <div className="flex gap-4">
          {cta ? (
            <Link href={cta.link}>
              <Button variant="primary">{cta.text}</Button>
            </Link>
          ) : null}
          {secondary ? (
            <Link href={secondary.link}>
              <Button variant="secondary">{secondary.text}</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
