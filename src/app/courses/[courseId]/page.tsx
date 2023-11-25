import { Course, User } from "@prisma/client";
import { Container, Heading, Section } from "@radix-ui/themes";
import { redirect } from "next/navigation";
export default async function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const { courseId } = params;
  const response = await fetch(
    `${process.env.API_BASE_URL}/courses/single/${courseId}`,
  );
  const data = await response.json();
  const course: Course = data.data?.course;
  const createdBy: User = data.data?.user;
  if (!course || data.message != "Course found") redirect("/404");

  return (
    <Section>
      <Container size={"3"}>
        <Heading size={"9"} as={"h1"}>
          {course.courseName}
        </Heading>
        <Heading size={"5"} as={"h2"}>
          By: {createdBy.name}
        </Heading>
      </Container>
    </Section>
  );
}
