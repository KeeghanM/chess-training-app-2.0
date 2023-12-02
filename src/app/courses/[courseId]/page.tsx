import { Course, User } from "@prisma/client";
import { redirect } from "next/navigation";
import PageHeader from "~/app/components/_layouts/pageHeader";
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
    <PageHeader
      title={course.courseName}
      image={{ src: "/images/hero.avif", alt: course.courseName }}
      subTitle={`By: ${createdBy.name}`}
    />
  );
}
