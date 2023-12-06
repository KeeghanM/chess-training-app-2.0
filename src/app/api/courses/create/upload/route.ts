import type { Course, Group as PrismaGroup } from "@prisma/client";
import { errorResponse, successResponse } from "../../../responses";
import { prisma } from "~/server/db";
import { getUserServer } from "~/app/_util/getUserServer";

export async function POST(request: Request) {
  // Check if user is authenticated and reject request if not
  const { user } = await getUserServer();

  const authToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!user || user.id !== authToken) return errorResponse("Unauthorized", 401);

  const { courseName, description, groupNames, lines, slug } =
    (await request.json()) as {
      courseName: string;
      slug: string;
      description: string;
      groupNames: {
        groupName: string;
      }[];
      lines: {
        groupName: string;
        colour: string;
        moves: string;
      }[];
    };

  if (!courseName || !groupNames || !lines || !slug)
    return errorResponse("Missing required fields", 400);

  // Check slug is valid
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) return errorResponse("Invalid slug", 400);

  // Check if course name is available
  const existingCourse = await prisma.course.findFirst({
    where: {
      slug: slug,
    },
  });

  if (existingCourse) return errorResponse("Course name is not available", 400);

  try {
    // Create a new global course and it's groups
    const course = (await prisma.course.create({
      include: {
        groups: true,
      },
      data: {
        courseName: courseName,
        courseDescription: description,
        createdBy: user.id,
        slug: slug,
        groups: {
          create: groupNames,
        },
      },
    })) as Course & { groups: PrismaGroup[] };

    // Link the user to the course by creating their userCourse
    const userCourse = await prisma.userCourse.create({
      data: {
        course: {
          connect: {
            id: course.id,
          },
        },
        linesUnseen: lines.length,
        userId: user.id,
      },
    });

    // Create each new line and userLine
    await Promise.all(
      lines.map(async (line) => {
        const matchingGroup = course.groups.find(
          (group) => group.groupName === line.groupName,
        );
        if (!matchingGroup) throw new Error("Group not found");

        const dbLine = await prisma.line.create({
          data: {
            colour: line.colour,
            moves: line.moves,
            groupId: matchingGroup.id,
            courseId: course.id,
          },
        });

        await prisma.userLine.create({
          data: {
            courseId: course.id,
            userId: user.id,
            userCourseId: userCourse.id,
            lineId: dbLine.id,
          },
        });
      }),
    );

    return successResponse(
      "Course created",
      {
        slug: slug,
      },
      200,
    );
  } catch (e) {
    if (e instanceof Error) return errorResponse(e.message, 500);
    else return errorResponse("Unknown error", 500);
  }
}
