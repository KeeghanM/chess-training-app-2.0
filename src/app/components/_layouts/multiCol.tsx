import Container from "../_elements/container";
import Heading from "../_elements/heading";

interface MultiColItemProps {
  title: string;
  children: React.ReactNode;
}

interface MultiColProps {
  title?: string;
  background: "light" | "dark";
  children: React.ReactNode;
}

export function MultiColItem(props: MultiColItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <Heading as={"h3"}>{props.title}</Heading>
      <div>{props.children}</div>
    </div>
  );
}

export function MultiCol(props: MultiColProps) {
  return (
    <div
      className={`w-full ${
        props.background === "light" ? "bg-white" : "bg-purple-100"
      }`}
    >
      <Container>
        <div className="flex flex-col items-center justify-center gap-4">
          {props.title && <Heading as={"h2"}>{props.title}</Heading>}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {props.children}
          </div>
        </div>
      </Container>
    </div>
  );
}
