import { getServerAuthSession } from "~/server/auth"

export default async function Header() {
    const session = await getServerAuthSession()
    console.log(session)
    return (
        <header>
            <h1>Welcome, {session?.user ? session.user.name : "Newb" } </h1>
        </header>
    )
}