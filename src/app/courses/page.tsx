import StyledLink from "../components/_elements/styledLink";
import CtaRow from "../components/_layouts/ctaRow";
import { MultiCol, MultiColItem } from "../components/_layouts/multiCol";
import PageHeader from "../components/_layouts/pageHeader";

export default function Courses() {
  return (
    <>
      <PageHeader
        title="Browse Courses"
        subTitle="Coming soon!"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
      <MultiCol background="light">
        <MultiColItem title="We're working hard">
          <p>
            to bring you the best courses we can. We'll be launching our first
            courses in the next few months, so stay tuned!
          </p>
        </MultiColItem>
        <MultiColItem title="In the meantime">
          <p>
            consider{" "}
            <StyledLink href="/courses/create" text="creating your own" /> with
            our Course Creation tool.
          </p>
          <p>Simply copy paste a PGN file, and you're off!</p>
        </MultiColItem>
      </MultiCol>
      <CtaRow
        title="Create your own course"
        cta={{
          text: "Create a Course",
          link: "/courses/create",
        }}
        background="dark"
      >
        <p></p>
      </CtaRow>
    </>
  );
}
