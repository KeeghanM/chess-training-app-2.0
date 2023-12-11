import type { Course, UserProfile } from "@prisma/client";
import { redirect } from "next/navigation";
import type { ResponseJson } from "~/app/api/responses";
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
  const data = (await response.json()) as ResponseJson;
  const course = data.data!.course as Course;
  const createdBy = data.data!.user as UserProfile;
  if (!course || data.message != "Course found") redirect("/404");

  return (
    <PageHeader
      title={course.courseName}
      image={{ src: "/images/hero.avif", alt: course.courseName }}
      subTitle={`By: ${createdBy.username}`}
    />
  );
}
