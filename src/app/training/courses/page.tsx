import { redirect } from "next/navigation";
import CourseListItem from "~/app/components/training/courses/list/CourseListItem";
import Error from "~/app/components/general/ErrorPage";
import { GetUserCourses } from "~/app/_util/GetUserCourse";
import Container from "~/app/components/_elements/container";
import PageHeader from "~/app/components/_layouts/pageHeader";
import Heading from "~/app/components/_elements/heading";
import StyledLink from "~/app/components/_elements/styledLink";
import { getUserServer } from "~/app/_util/getUserServer";

export const metadata = {
  title: "Your Courses - ChessTraining.app",
};

export default async function Courses() {
  const { user } = await getUserServer();
  if (!user) redirect("/auth/signin");

  const courses = await GetUserCourses();
  if (!courses) return <Error PageTitle="Your Courses" />;

  return (
    <>
      <PageHeader
        title="Your Courses"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
      <Container>
        <div className="flex flex-col gap-4">
          {courses.length > 0 ? (
            courses.map((course) => <CourseListItem userCourse={course} />)
          ) : (
            <div>
              <Heading as="h3">You haven't got any courses yet</Heading>
              <p className="text-gray-500">
                You can browse courses from the{" "}
                <StyledLink href="/courses" text="courses list" /> or try{" "}
                <StyledLink href="/courses/create" text="creating your own" />.
              </p>
            </div>
          )}
        </div>
      </Container>
    </>
  );
}
