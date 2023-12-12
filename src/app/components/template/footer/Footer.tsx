import Link from "next/link";
import Heading from "../../_elements/heading";

export default function Footer() {
  const sections: {
    title: string;
    links: {
      icon?: React.ReactNode;
      text: string;
      url: string;
    }[];
  }[] = [
    {
      title: "ChessTraining.app",
      links: [
        {
          text: "All Features",
          url: "/about/features",
        },
        {
          text: "Product Roadmap",
          url: "/product-roadmap",
        },
        {
          text: "Natural Play Learning",
          url: "/about/features/natural-play-learning",
        },
        {
          text: "Course Trainer",
          url: "/courses",
        },
        {
          text: "Tactics Trainer",
          url: "/training/tactics",
        },
        {
          text: "Knight Vision",
          url: "/training/knight-vision",
        },
        {
          text: "Endgame Trainer",
          url: "/training/endgames",
        },
        {
          text: "Visualisation & Calculation",
          url: "/training/visualisation",
        },
      ],
    },
    {
      title: "The Company",
      links: [
        {
          text: "Meet the team",
          url: "/about/meet-the-team",
        },
        {
          text: "About Us",
          url: "/about",
        },
        {
          text: "Our Mission",
          url: "/about#our-mission",
        },
        {
          text: "Our Vision",
          url: "/about#our-vision",
        },
        {
          text: "Our Values",
          url: "/about#our-values",
        },
        {
          text: "Our Culture",
          url: "/about#our-culture",
        },
        {
          text: "Our Story",
          url: "/about#our-story",
        },
      ],
    },
    {
      title: "Support",
      links: [
        {
          text: "Contact Us",
          url: "/contact",
        },
        {
          text: "Report an issue",
          url: "/report-an-issue",
        },
        {
          text: "Privacy Policy",
          url: "/privacy-policy",
        },
        {
          text: "Terms & Conditions",
          url: "/terms-and-conditions",
        },
      ],
    },
    {
      title: "Socials",
      links: [
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"
              />
            </svg>
          ),
          text: "Instagram",
          url: "https://www.instagram.com/chess_training_app/",
        },
        {
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 128 128"
            >
              <path
                fill="currentColor"
                d="M75.916 54.2L122.542 0h-11.05L71.008 47.06L38.672 0H1.376l48.898 71.164L1.376 128h11.05L55.18 78.303L89.328 128h37.296L75.913 54.2ZM60.782 71.79l-4.955-7.086l-39.42-56.386h16.972L65.19 53.824l4.954 7.086l41.353 59.15h-16.97L60.782 71.793Z"
              />
            </svg>
          ),
          text: "X/Twitter",
          url: "https://twitter.com/ChessTrainingAp",
        },
      ],
    },
  ];

  return (
    <footer className="bg-gray-800 text-white p-4 md:px-12 flex flex-col text-sm gap-4">
      <div className="flex flex-col md:flex-row justify-evenly gap-4 md:gap-6">
        {sections.map((section, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Heading as={"h3"}>{section.title}</Heading>
            {section.links.map((link, i) => (
              <Link
                key={i}
                href={link.url}
                className="hover:underline flex items-center gap-2"
              >
                {link.icon}
                <span>{link.text}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="flex justify-center text-xs italic">
        <p>&copy; 2020-2023 ChessTraining.app</p>
      </div>
    </footer>
  );
}
