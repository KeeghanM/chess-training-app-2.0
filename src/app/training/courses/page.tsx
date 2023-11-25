import { Container, Em, Flex, Heading, Section } from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import CourseListItem from "~/app/components/courses/list/CourseListItem";
import { Course, UserCourse } from "@prisma/client";

export type PrismaCourse = UserCourse & { course: Course };

export default async function Courses() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const resp = await fetch(`${process.env.API_BASE_URL}/courses/user`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.user.id}`,
    },
  });
  const json = await resp.json();
  if (json.message != "Courses found") {
    console.log(json);
    return <Error />;
  }
  const courses = json.data.courses as PrismaCourse[];

  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Flex direction={"column"} gap={"4"}>
          <Heading size="9" as="h1">
            Your Courses
          </Heading>
          {courses.map((course, index: number) => (
            <CourseListItem
              userCourse={course}
              background={index % 2 == 0 ? "var(--plum-4)" : "var(--plum-5)"}
            />
          ))}
        </Flex>
      </Container>
    </Section>
  );
}

function Error() {
  return (
    <Section>
      <Container p={{ initial: "2", lg: "0" }}>
        <Flex direction={"column"} gap={"4"}>
          <Heading size="9" as="h1">
            Your Courses
          </Heading>
          <Heading size="6" as="h2" color={"red"}>
            <Em>Something went wrong, please try again later.</Em>
          </Heading>
        </Flex>
      </Container>
    </Section>
  );
}
