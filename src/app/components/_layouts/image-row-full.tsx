import Container from '@/app/components/_elements/container';
import Heading from '@/app/components/_elements/heading';

interface ImageRowProps {
  heading: string;
  imageSide: 'left' | 'right';
  image: {
    src: string;
    alt: string;
  };
  background: 'light' | 'dark';
  children: React.ReactNode;
}

export function ImageRowFull({
  heading,
  imageSide,
  image,
  background,
  children,
}: ImageRowProps) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center py-4 md:flex-row md:py-6 lg:py-12${
        imageSide === 'left' ? '' : ' md:flex-row-reverse'
      }${background === 'light' ? ' bg-white' : ' bg-purple-100'}`}
    >
      <div
        className={`w-full md:absolute md:inset-0 md:w-1/2${
          imageSide === 'left' ? '' : ' md:ml-auto'
        }`}
      >
        <img
          alt={image.alt}
          className="mx-auto h-full max-h-[350px] w-full max-w-[750px] object-cover object-[50%_25%] md:max-h-full"
          src={image.src}
        />
      </div>
      <div
        className={`w-full md:w-1/2${
          imageSide === 'left' ? ' md:ml-auto' : ' md:mr-auto'
        }`}
      >
        <Container>
          <Heading as="h2">{heading}</Heading>
          <div className="flex flex-col gap-4">{children}</div>
        </Container>
      </div>
    </div>
  );
}
