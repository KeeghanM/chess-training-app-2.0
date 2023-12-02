import { redirect } from "next/navigation";
import Error from "~/app/components/general/ErrorPage";
import { getServerAuthSession } from "~/server/auth";
import { GetUserCourse } from "~/app/util/GetUserCourse";
import CourseTrainer from "~/app/components/training/courses/CourseTrainer";
import Container from "~/app/components/_elements/container";
import Heading from "~/app/components/_elements/heading";
import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function ({ params }: { params: { courseId: string } }) {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

  const { userCourse, userLines, userFens } = await GetUserCourse(
    params.courseId,
  );
  if (!userCourse || !userLines) return <Error PageTitle="Studying:" />;

  return (
    <>
      <PageHeader
        title={"Training Course: " + userCourse.course.courseName}
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
      <Container>
        {userCourse && (
          <CourseTrainer
            userCourse={userCourse}
            userLines={userLines}
            userFens={userFens}
          />
        )}
      </Container>
    </>
  );
}
