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

export default function ImageRowFull(props: ImageRowProps) {
  return (
    <div
      className={
        "flex flex-col md:flex-row items-center justify-center" +
        (props.imageSide === "left" ? "" : " md:flex-row-reverse") +
        (props.background === "light" ? " bg-white" : " bg-purple-100")
      }
    >
      <div className="w-full md:w-1/2">
        <img src={props.image.src} alt={props.image.alt} />
      </div>
      <div className="w-full md:w-1/2">
        <Container>
          <Heading as={"h2"}>{props.heading}</Heading>
          <div className="mt-4">{props.children}</div>
        </Container>
      </div>
    </div>
  );
}
