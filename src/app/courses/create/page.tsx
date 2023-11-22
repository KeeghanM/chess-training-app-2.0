import { Container, Heading, Section, Text } from "@radix-ui/themes";
import CreateCourseForm from "~/app/components/courses/create/CreateCourseForm";

export default function CreateCourse() {
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Heading size="9" as="h1">
          Create a new course
        </Heading>
        <Text></Text>
      </Container>
      <CreateCourseForm />
    </Section>
  );
}
