import { redirect } from "next/navigation";
import Error from "~/app/components/general/ErrorPage";
import { GetUserCourse } from "~/app/_util/GetUserCourse";
import CourseTrainer from "~/app/components/training/courses/CourseTrainer";
import Container from "~/app/components/_elements/container";
import PageHeader from "~/app/components/_layouts/pageHeader";
import { getUserServer } from "~/app/_util/getUserServer";

export default async function CourseTrainPage({
  params,
}: {
  params: { courseId: string };
}) {
  const { user } = await getUserServer();
  if (!user) redirect("/auth/signin");

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
