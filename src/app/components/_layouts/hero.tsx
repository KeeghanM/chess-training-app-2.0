import Heading from "../_elements/heading";
import Button from "../_elements/button";
import Link from "next/link";

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

export default function Hero(props: HeroProps) {
  return (
    <div className="relative min-h-[60vh] flex flex-col justify-center">
      <div className="absolute inset-0">
        <img
          className="w-full h-full object-cover"
          src={props.image.src}
          alt={props.image.alt}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #ffe9da 0%, rgba(249,115,22,0.5) 100%)",
          }}
          aria-hidden="true"
        />
      </div>
      <div className="relative flex flex-col gap-4 px-4 md:px-12 lg:px-24 py-2 md:py-4 lg:py-6">
        <Heading as={"h1"}>{props.title}</Heading>
        <div className="md:max-w-[50%]">{props.children}</div>
        <div className="flex gap-4">
          {props.cta && (
            <Link href={props.cta.link}>
              <Button text={props.cta.text} variant="primary" />
            </Link>
          )}
          {props.secondary && (
            <Link href={props.secondary.link}>
              <Button text={props.secondary.text} variant="secondary" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
