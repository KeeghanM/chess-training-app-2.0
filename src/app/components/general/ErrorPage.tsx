import { Container, Em, Flex, Heading, Section } from "@radix-ui/themes";

export default function Error(props: { PageTitle: string; error?: string }) {
  // TODO: Add error logging to the server
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Flex direction={"column"} gap={"4"}>
          <Heading size="9" as="h1">
            {props.PageTitle}
          </Heading>
          <Heading size="6" as="h2" color={"red"}>
            <Em>Something went wrong, please try again later.</Em>
          </Heading>
        </Flex>
      </Container>
    </Section>
  );
}
