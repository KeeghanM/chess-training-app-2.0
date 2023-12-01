import Button from "../_elements/button";
import Container from "../_elements/container";
import Heading from "../_elements/heading";
import Link from "next/link";

interface CtaRowProps {
  heading: string;
  cta: {
    text: string;
    link: string;
  };
  secondary?: {
    text: string;
    link: string;
  };
  background: "light" | "dark";
  children: React.ReactNode;
}

export default function CtaRow(props: CtaRowProps) {
  return (
    <div className={props.background == "light" ? "bg-white" : "bg-purple-100"}>
      <Container>
        <div className="flex flex-col gap-4">
          <Heading as={"h2"}>{props.heading}</Heading>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {props.children}
          </div>
          <div className="flex gap-4">
            <Link href={props.cta.link}>
              <Button text={props.cta.text} variant="primary" />
            </Link>
            {props.secondary && (
              <Link href={props.secondary.link}>
                <Button text={props.secondary.text} variant="secondary" />
              </Link>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
