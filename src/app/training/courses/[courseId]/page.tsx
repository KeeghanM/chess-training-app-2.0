import { redirect } from "next/navigation";
import Error from "~/app/components/general/ErrorPage";
import { Container, Heading, Section } from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { GetUserCourse } from "~/app/util/GetUserCourse";
import CourseTrainer from "~/app/components/training/courses/CourseTrainer";

export default async function ({ params }: { params: { courseId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const { userCourse, userLines, userFens } = await GetUserCourse(
    params.courseId,
  );
  if (!userCourse || !userLines) return <Error PageTitle="Studying:" />;

  return (
    <Section>
      <Container size={"3"}>
        <Heading size={"9"} as={"h1"}>
          {userCourse.course.courseName}
        </Heading>
        <CourseTrainer
          userCourse={userCourse}
          userLines={userLines}
          userFens={userFens}
        />
      </Container>
    </Section>
  );
}
