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
  // the image should take up the full width and height of
  // its container, so we'll use an absolute positioned
  // image with an inset-0 class to achieve this
  return (
    <div
      className={
        "relative flex flex-col md:flex-row items-center justify-center" +
        (props.imageSide === "left" ? "" : " md:flex-row-reverse") +
        (props.background === "light" ? " bg-white" : " bg-purple-100")
      }
    >
      <div
        className={
          "w-full md:w-1/2 md:absolute md:inset-0" +
          (props.imageSide === "left" ? "" : " md:ml-auto")
        }
      >
        <img
          className="w-full h-full object-cover max-h-[200px] md:max-h-full"
          src={props.image.src}
          alt={props.image.alt}
        />
      </div>
      <div
        className={
          "w-full md:w-1/2" +
          (props.imageSide === "left" ? " md:ml-auto" : " md:mr-auto")
        }
      >
        <Container>
          <Heading as={"h2"}>{props.heading}</Heading>
          <div className="flex flex-col gap-4">{props.children}</div>
        </Container>
      </div>
    </div>
  );
}
