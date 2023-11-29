import Link from "next/link";

interface LinkProps {
  href: string;
  text: string;
}
export default function StyledLink(props: LinkProps) {
  return (
    <Link
      href={props.href}
      className={
        "text-purple-700 hover:text-purple-600 underline hover:no-underline font-bold"
      }
    >
      {props.text}
    </Link>
  );
}
