import Heading from "~/app/components/_elements/heading";
import StyledLink from "~/app/components/_elements/styledLink";
import Hero from "~/app/components/_layouts/hero";
import { MultiCol, MultiColItem } from "~/app/components/_layouts/multiCol";

export const metadata = {
  title: "Meet Our Team - The Minds Behind ChessTraining.app",
};

export default function MeetTheTeam() {
  const teamMembers: {
    name: string;
    title: string;
    image: string;
    bio: string;
    links: {
      text: string;
      url: string;
    }[];
  }[] = [
    {
      name: "Keeghan McGarry",
      title: "Founder & Lead Developer",
      image: "/images/team/keeghan.png",
      bio: "Keeghan is a passionate chess player and software developer, with a background in computer science and business management. A mostly self-taught chess player, prior to meeting Roger, he's currently working towards his National Master title.",
      links: [
        {
          text: "Twitter",
          url: "https://twitter.com/keeghan",
        },
        {
          text: "GitHub",
          url: "https://www.github.com/keeghanm",
        },
        {
          text: "LinkedIn",
          url: "https://www.linkedin.com/in/keeghanm",
        },
        {
          text: "LiChess",
          url: "https://www.lichess.org/@/TastyTastyCookies",
        },
      ],
    },
    {
      name: "NM Roger Williamson",
      title: "Head of Chess",
      image: "/images/team/roger.png",
      bio: "Roger is a National Master from the United Kingdom. He's a passionate chess player and coach, with a background in education. Roger has been playing chess for over 30 years and coaching for more than 20.",
      links: [
        {
          text: "Twitter",
          url: "https://twitter.com/rogerchess",
        },
        {
          text: "LiChess",
          url: "https://www.lichess.org/@/ZombieBlitz",
        },
      ],
    },
  ];

  return (
    <>
      <Hero
        title="Meet the Team"
        image={{
          src: "/images/hero.avif",
          alt: "Team Image",
        }}
      >
        <p>
          ChessTraining.app has grown since it was founded in 2020 by Keeghan,
          read more about the team behind the platform below.
        </p>
      </Hero>
      <MultiCol title="Meet the Team" background="dark">
        {teamMembers.map((member, index) => (
          <MultiColItem key={index} title={member.name}>
            <Heading as="h4" color="text-[rgba(0,0,0,0.5)]">
              {member.title}
            </Heading>
            <p>{member.bio}</p>
            <ul className="list-disc ml-4">
              {member.links.map((link) => (
                <li>
                  <StyledLink href={link.url} text={link.text} />
                </li>
              ))}
            </ul>
          </MultiColItem>
        ))}
      </MultiCol>
    </>
  );
}
