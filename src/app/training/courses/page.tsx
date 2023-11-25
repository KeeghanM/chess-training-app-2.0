import { Container, Flex, Heading, Section } from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import CourseListItem from "~/app/components/courses/list/CourseListItem";
import Error from "~/app/components/general/ErrorPage";
import { GetUserCourses } from "~/app/util/GetUserCourse";

export default async function Courses() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const courses = await GetUserCourses();
  if (!courses) return <Error PageTitle="Your Courses" />;

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
