import { Box,  Container, Flex, Heading, Link } from "@radix-ui/themes"
import Image from 'next/image'
import { getServerAuthSession } from "~/server/auth"
import LoginOrDash from "./LoginOrDash"

export default async function Header() {
    const session = await getServerAuthSession()
    const menuItems = [
        { name: "Home", href: "/" },
        { name: "Find Courses", href: "/courses" },
        { name: "Training", href: "/training" },
        { name: "About", href: "/about" },
        { name:"Blog", href: "/blog"},
        {name:"Contact", href: "/contact"}
    ]
    return (
        <Box p="4" style={{backgroundColor:'var(--plum-3)'}}>
            <Container>
                <Flex direction="row" align="center" justify="between">
                    <Flex direction="row" align="center">
                        <Image src="/chesstrainingapplogo.webp" alt="ChessTraining.app"
                        width={50} height={50} />
                        <Heading>ChessTraining.app</Heading>
                    </Flex>
                    <Flex direction="row" align="center" gap="4">
                        {menuItems.map((item) => (
                            <Link href={item.href} key={item.name} size="5">
                                {item.name}
                            </Link>))}
                            
                    </Flex>    
                    <LoginOrDash />          
                </Flex>
            </Container>
        </Box>
    )
}