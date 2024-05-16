import Link from 'next/link';

import { Button } from '@/app/components/_elements/button';
import { Heading } from '@/app/components/_elements/heading';

interface MultiColItemProps {
  title: string;
  children: React.ReactNode;
}

interface MultiColProps {
  title?: string;
  background: 'light' | 'dark';
  cta?: {
    text: string;
    link: string;
  };
  children: React.ReactNode;
}

export const MultiColItem = ({ title, children }: MultiColItemProps) => {
  return (
    <div className="flex flex-1 flex-col gap-0 border border-gray-300 bg-[rgba(0,0,0,0.03)]">
      <div className="border-b border-gray-300 px-2 py-1 font-bold">
        <Heading as="h3" color="text-orange-500 !m-0 !p-0">
          {title}
        </Heading>
      </div>
      <div className="flex flex-col gap-2 p-2">{children}</div>
    </div>
  );
};

export const MultiCol = ({
  title,
  background,
  cta,
  children,
}: MultiColProps) => {
  return (
    <div
      className={`w-full ${
        background === 'light' ? 'bg-white' : 'bg-purple-100'
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-6 md:px-6 md:py-12 lg:px-12">
        {title ? <Heading as="h2">{title}</Heading> : null}
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {children}
        </div>
        {cta ? (
          <div className="">
            <Link href={cta.link}>
              <Button variant="accent">{cta.text}</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};
