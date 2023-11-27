import {
  Flex,
  Text,
  Box,
  Container,
  Heading,
  Section,
  Em,
} from "@radix-ui/themes";

export async function MyApp() {
  return (
    <Section>
      <Container>
        <Flex direction="column" gap="4" align="center">
          <Heading as="h1" size="9">
            Welcome to ChessTraining.app
          </Heading>
          <Heading as="h2" size="6">
            <Em>Are you ready to bring your chess to the next level?</Em>
          </Heading>
          <Box style={{ maxWidth: "550px" }}>
            <Text as="p" align="center">
              Use our powerful training tools, backed by science and Grand
              Master training methods, to shape up your chess and bring in the
              wins!
            </Text>
          </Box>
        </Flex>
      </Container>
    </Section>
  );
}
