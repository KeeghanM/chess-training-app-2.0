import Link from 'next/link';

import { Button } from '@/app/components/_elements/button';
import { Container } from '@/app/components/_elements/container';
import { Heading } from '@/app/components/_elements/heading';

interface CtaRowProps {
  title: string;
  cta: {
    text: string;
    link: string;
  };
  secondary?: {
    text: string;
    link: string;
  };
  background: 'light' | 'dark';
  children: React.ReactNode;
}

export function CtaRow({
  title,
  cta,
  secondary,
  background,
  children,
}: CtaRowProps) {
  return (
    <div className={background === 'light' ? 'bg-white' : 'bg-purple-100'}>
      <Container>
        <div className="flex flex-col gap-4">
          <Heading as="h2">{title}</Heading>
          <div className="flex flex-col gap-4 md:flex-row md:gap-6">
            {children}
          </div>
          <div className="flex gap-4">
            <Link href={cta.link}>
              <Button variant="primary">{cta.text}</Button>
            </Link>
            {secondary ? (
              <Link href={secondary.link}>
                <Button variant="secondary">{secondary.text}</Button>
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}
