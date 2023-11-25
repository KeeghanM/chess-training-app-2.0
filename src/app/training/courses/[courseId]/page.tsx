import { redirect } from "next/navigation";
import Error from "~/app/components/general/ErrorPage";
import { Container, Heading, Section } from "@radix-ui/themes";
import { getServerAuthSession } from "~/server/auth";
import { GetUserCourse } from "~/app/util/GetUserCourse";

export default async function ({ params }: { params: { courseId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const userCourse = await GetUserCourse(params.courseId);
  if (!userCourse) return <Error PageTitle="Studying:" />;

  return (
    <Section>
      <Container size={"3"}>
        <Heading size={"9"} as={"h1"}>
          Studying: {userCourse.course.courseName}
        </Heading>
      </Container>
    </Section>
  );
}
