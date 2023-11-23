import { Box, Container, Flex, Heading, Link } from "@radix-ui/themes";
import Image from "next/image";
import LoginOrDash from "./LoginOrDash";

export default async function Header() {
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Browse Courses", href: "/courses" },
    { name: "Puzzles", href: "/training/puzzles" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];
  return (
    <Box p="4" style={{ backgroundColor: "var(--gray-4)" }}>
      <Container>
        <Flex direction="row" align="center" justify="between">
          <Link href="/" style={{ color: "white", textDecoration: "none" }}>
            <Flex direction="row" align="center">
              <Image
                src="/chesstrainingapplogo.webp"
                alt="ChessTraining.app"
                width={50}
                height={50}
              />
              <Heading>ChessTraining.app</Heading>
            </Flex>
          </Link>
          <Flex
            direction="row"
            align="center"
            gap="4"
            display={{ initial: "none", md: "flex" }}
          >
            {menuItems.map((item) => (
              <Link href={item.href} key={item.name} size="5">
                {item.name}
              </Link>
            ))}
            <Box ml={"auto"}>
              <LoginOrDash />
            </Box>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
