import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";
import { Container, Flex, Grid, Heading, Section } from "@radix-ui/themes";
import ToolGrid from "../components/dashboard/ToolGrid";

export type Tool = {
  name: string;
  description: string[];
  href: string;
  buttonText: string;
};

export default async function Dashboard() {
  const session = await getServerAuthSession();

  // Redirect to login if no session
  if (!session) redirect("/api/auth/signin");

  const user = session.user;

  const tools: Tool[] = [
    {
      name: "Study Course",
      description: [
        "Study a course you have created, or one that has been shared with you.",
        "Built using spaced repetition, our courses are a great way to learn.",
      ],
      href: "/training/courses",
      buttonText: "Train",
    },
    {
      name: "Puzzle Training",
      description: [
        "Train tactics using the WoodPecker Method developed by GM's Axel Smith, and Hans Tikkanen.",
        "Re-program your unconscious mind. With benefits including sharper tactical vision, fewer blunders, and better play when in time trouble as well as improved intuition.",
        "Generate puzzle sets and train on them, while the site takes care of tracking your accuracy & time spent.",
      ],
      href: "/training/puzzles",
      buttonText: "Train",
    },
    {
      name: "Endgame Training",
      description: [
        "Fundamental to the game of chess, endgames are an area of chess which many players neglect in their training.",
        "Not as exciting as openings, not as sexy as middlegame tactics, but arguably much more important than either.",
        "Pick from Queen, Rook, Knight, Bishop, or Pawn endgames. Or let fate decide.",
      ],
      href: "/training/endgames",
      buttonText: "Train",
    },
    {
      name: "Visualisation & Calculation",
      description: [
        "Do you struggle to see past two or three moves? Find long calculations difficult? This is for you.",
        "With our visualisation trainer you are presented with a board position, and a list of moves at the end of which will be a simple tactic.",
        "All you need to do is play the given sequence of moves in your head, decide on your final move and then check if you were correct.",
      ],
      href: "/training/visualisation",
      buttonText: "Train",
    },
    {
      name: "Knight Vision",
      description: [
        "Whether you are a beginner, intermediate, or even experienced player - board vision is crucial to the game of Chess.",
        "We have devised a very simple method of improving your board vision through the use of knights.",
        "Simply put, race against the clock to calculate the fastest way a knight can get to a given square. Rack up a streak and try to beat your own high score.",
      ],
      href: "/training/knight-vision",
      buttonText: "Train",
    },
    {
      name: "Find Courses",
      description: [
        "Browse our library of courses to find the perfect one for you.",
        "Courses are created by our community, and cover a wide range of topics.",
      ],
      href: "/courses",
      buttonText: "Find",
    },
    {
      name: "Create a Course",
      description: [
        "Create your own course, either for yourself or to share with others.",
        "Courses can be shared with the community, or kept private.",
        "Simply upload a PGN file, and we will take care of the rest.",
      ],
      href: "/courses/create",
      buttonText: "Create",
    },
    {
      name: "Account Settings",
      description: [
        "Modify training defaults, change your password, or update your email address.",
        "You can also delete your account here.",
      ],
      href: "/account/settings",
      buttonText: "Open",
    },
  ];

  return (
    <Section>
      <Container px={{ initial: "4", lg: "0" }}>
        <Flex direction={"column"} gap={"4"}>
          <Heading size="9">Welcome back, {user.name}.</Heading>
          <Grid columns={{ initial: "1", md: "3", lg: "4" }} gap={"4"}>
            {tools.map((tool) => (
              <ToolGrid tool={tool} />
            ))}
          </Grid>
        </Flex>
      </Container>
    </Section>
  );
}
