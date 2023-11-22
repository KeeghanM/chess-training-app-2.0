import { Container, Em, Heading, Section } from "@radix-ui/themes";

export default function Courses() {
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Heading size="9" as="h1">
          Browse Courses
        </Heading>
        <Heading size="6" as="h2">
          <Em>Coming soon!</Em>
        </Heading>
      </Container>
    </Section>
  );
}
