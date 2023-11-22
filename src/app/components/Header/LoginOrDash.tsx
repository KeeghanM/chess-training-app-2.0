'use client'
import { Avatar, Button, Flex } from "@radix-ui/themes"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginOrDash() {
    const { data: session, status } = useSession()
    const router = useRouter()

    return (
        <Flex direction="row" align="center" gap="2">
            {status === 'authenticated' && session.user?.name ? (<>
                <Avatar src={session.user.image!} fallback="A" />
                <Flex direction="row" gap="2">
                    <Button onClick={()=>router.push('/dashboard')} >Dashboard</Button>
                    <Button color="red" variant="soft" onClick={()=>router.push('/api/auth/signout')}>Logout</Button>
                </Flex>
            </>
            ) : (
                <Flex direction="row" gap="2">
                    <Button onClick={()=>router.push('/api/auth/signin')}>Login/Register</Button>
                </Flex>
            )}
        </Flex>
    )
}