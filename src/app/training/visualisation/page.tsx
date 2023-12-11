import CtaRow from "~/app/components/_layouts/ctaRow";
import PageHeader from "~/app/components/_layouts/pageHeader";

export const metadata = {
  title:
    "Visualization & Calculation Training - Advance Your Chess Strategy at ChessTraining.app",
  description:
    "Refine your foresight with ChessTraining.app's Visualization & Calculation training. Tailored for players seeking to enhance their ability to foresee multiple moves ahead, this tool is crucial for long-term planning in chess. Challenge yourself with complex board scenarios and improve your decision-making skills. Perfect for those looking to deepen their tactical understanding and elevate their game to the next level.",
};

export default async function Visualisation() {
  return (
    <>
      <PageHeader
        title="Visualisation & Calculation"
        subTitle="Coming soon!"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
      <CtaRow
        title="Curious?"
        background="light"
        cta={{
          text: "View our roadmap",
          link: "/product-roadmap",
        }}
      >
        <div className="flex flex-col gap-2">
          <p>
            We're working hard to bring you this feature as soon as possible. If
            you want to know more about our upcoming features, check out our
            roadmap.
          </p>
          <p className="italic">
            P.s You can also see all our other upcoming feature releases.
          </p>
        </div>
      </CtaRow>
    </>
  );
}
