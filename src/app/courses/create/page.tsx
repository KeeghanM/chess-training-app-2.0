import { Container, Heading, Section } from "@radix-ui/themes";
import CreateCourseForm from "~/app/components/courses/create/CreateCourse";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function CreateCourse() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Heading size="9" as="h1">
          Create a new course
        </Heading>
        <CreateCourseForm />
      </Container>
    </Section>
  );
}
