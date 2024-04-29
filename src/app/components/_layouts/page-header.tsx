import Image from 'next/image';

import Heading from '@/app/components/_elements/heading';

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  image: {
    src: string;
    alt: string;
  };
}

export function PageHeader({ title, subTitle, image }: PageHeaderProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <Image
          fill
          alt={image.alt}
          className="h-full w-full object-cover object-center brightness-[.3] grayscale filter"
          src={image.src}
        />
      </div>
      <div className="relative px-4 py-2 md:px-12 md:py-4 lg:px-24 lg:py-6">
        <Heading as="h1" color="text-white">
          {title}
        </Heading>
        {subTitle ? (
          <Heading as="h2" bold={false} color="text-orange-500">
            {subTitle}
          </Heading>
        ) : null}
      </div>
    </div>
  );
}
