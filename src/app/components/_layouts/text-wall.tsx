import Container from '@/app/components/_elements/container';
import Heading from '@/app/components/_elements/heading';

interface TextWallProps {
  title: string;
  titleType?: 'h1' | 'h2' | 'h3';
  background: 'light' | 'dark';
  children: React.ReactNode;
}

export const TextWall = ({
  title,
  titleType,
  background,
  children,
}: TextWallProps) => {
  return (
    <div
      className={`w-full py-6 ${
        background === 'light' ? 'bg-white' : 'bg-purple-100'
      }`}
    >
      <Container>
        <Heading as={titleType ?? 'h2'}>{title}</Heading>
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {children}
        </div>
      </Container>
    </div>
  );
};
