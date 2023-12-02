import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import CourseListItem from "~/app/components/courses/list/CourseListItem";
import Error from "~/app/components/general/ErrorPage";
import { GetUserCourses } from "~/app/util/GetUserCourse";
import Container from "~/app/components/_elements/container";
import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function Courses() {
  const session = await getServerAuthSession();
  if (!session) redirect("/api/auth/signin");

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
          {courses.map((course, index: number) => (
            <CourseListItem
              userCourse={course}
              background={index % 2 == 0 ? "var(--plum-4)" : "var(--plum-5)"}
            />
          ))}
        </div>
      </Container>
    </>
  );
}
