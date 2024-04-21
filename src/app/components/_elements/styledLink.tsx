import Link from 'next/link'

interface LinkProps {
  href: string
  children: React.ReactNode
}
export default function StyledLink(props: LinkProps) {
  return (
    <Link
      href={props.href}
      className={
        'font-bold text-purple-700 underline hover:text-purple-600 dark:text-purple-400 hover:no-underline'
      }
    >
      {props.children}
    </Link>
  )
}
