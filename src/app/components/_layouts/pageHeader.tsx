import Container from "../_elements/container";
import Heading from "../_elements/heading";

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  image: {
    src: string;
    alt: string;
  };
}

export default function PageHeader(props: PageHeaderProps) {
  return (
    <div className="relative">
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
      <Container>
        <Heading as={"h1"}>Design Guide</Heading>
        {props.subTitle && <Heading as={"h2"}>{props.subTitle}</Heading>}
      </Container>
    </div>
  );
}
