import Container from "../_elements/container";
import Heading from "../_elements/heading";

interface ImageRowProps {
  heading: string;
  imageSide: "left" | "right";
  image: {
    src: string;
    alt: string;
  };
  background: "light" | "dark";
  children: React.ReactNode;
}

export default function ImageRow(props: ImageRowProps) {
  return (
    <div
      className={
        "flex flex-col md:flex-row items-center justify-center" +
        (props.imageSide === "left" ? "" : " md:flex-row-reverse") +
        (props.background === "light" ? " bg-white" : " bg-purple-100")
      }
    >
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
        <img
          src={props.image.src}
          alt={props.image.alt}
          className="w-full md:max-w-md"
        />
      </div>
      <div className="w-full md:w-1/2">
        <Container>
          <Heading as={"h2"}>{props.heading}</Heading>
          <div className="flex flex-col gap-4">{props.children}</div>
        </Container>
      </div>
    </div>
  );
}
