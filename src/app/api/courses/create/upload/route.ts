import { Course, PrismaClient, UserCourse } from "@prisma/client";
import { getServerAuthSession } from "~/server/auth";
import { Line } from "../parse/route";

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const session = await getServerAuthSession();
  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!session || session.user.id !== authToken) {
    return new Response(
      JSON.stringify({
        message: "Unauthorized",
      }),
      {
        status: 401,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const { courseName, description, group, lines } = (await request.json()) as {
    courseName: string;
    description: string;
    group: string;
    lines: Line[];
  };

  if (!courseName || !group || !lines) {
    return new Response(
      JSON.stringify({
        message: "Missing required fields",
      }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      },
    );
  }

  const groupNames = [
    ...new Set(
      lines
        .map((line) => line.tags[group])
        .filter((groupName) => groupName !== undefined),
    ),
  ];

  const prisma = new PrismaClient();
  let course: Course;
  let userCourse: UserCourse;

  // Create a new global course
  try {
    course = await prisma.course.create({
      data: {
        courseName: courseName,
        courseDescription: description,
        createdBy: session.user.id,
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e.message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // Setup the groups
  try {
    for (const groupName of groupNames) {
      await prisma.group.create({
        data: {
          course: {
            connect: {
              id: course.id,
            },
          },
          groupName: groupName,
        },
      });
    }
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e.message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // Link the user to the course by creating their userCourse
  try {
    userCourse = await prisma.userCourse.create({
      data: {
        user: {
          connect: {
            id: session.user.id,
          },
        },
        courseId: course.id,
        linesUnseen: lines.length,
      },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e.message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // Create the lines, and link the user to the line by creating their lineStat
  try {
    for (const line of lines) {
      const moveString = line.moves.map((move) => move.notation).join(",");

      const lineResponse = await prisma.line.create({
        data: {
          course: {
            connect: {
              id: course.id,
            },
          },
          groupName: group,
          colour: line.tags["Colour"] as string,
          moves: moveString,
        },
      });

      const lineStat = await prisma.lineStat.create({
        data: {
          courseId: course.id,
          userId: session.user.id,
          userCourseId: userCourse.id,
          lineId: lineResponse.id,
        },
      });

      for (let moves of line.moves) {
        await prisma.moveStat.create({
          data: {
            lineStatId: lineStat.id,
            move: moves.notation,
          },
        });
      }
    }
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        message: e.message,
      }),
      {
        status: 500,
        headers: { "content-type": "application/json" },
      },
    );
  }

  // All went well, so return the course id and line count
  return new Response(
    JSON.stringify({
      message: "Course Uploaded Successfully",
      data: {
        courseId: course.id,
        lineCount: lines.length,
      },
    }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}
