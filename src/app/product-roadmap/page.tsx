import StyledLink from "../components/_elements/styledLink";
import BigText from "../components/_layouts/bigText";
import { TextWall } from "../components/_layouts/textWall";

export default async function ProductRoadmap() {
  return (
    <>
      <TextWall background="dark" title="Our commitment to open development">
        <div className="flex flex-col gap-2 flex-1">
          <p>
            We think that transparency is an incredibly valuable thing, both in
            life and in business. To that end, we want to make sure that our
            Product Roadmap is as open and honest as it can be.
          </p>
          <p>
            Not only that, but as a customer your voice is most important. While
            we may think we know what is best, or what you want - ultimately,
            you know that.
          </p>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <p>
            To work towards this goal of open and transparent development, we
            have published our Product Roadmap for all to see.
          </p>
          <p>
            This includes ideas/features currently under consideration, things
            we're currently working on, as well as all previously released
            features.
          </p>
          <p>
            We have also enabled you to vote on features, and leave comments
            with your own ideas and feedback.
          </p>
        </div>
      </TextWall>
      <iframe
        src="https://starter.productboard.com/chesstraining-starter/1-chesstraining-app"
        width="100%"
        height="60vh"
        className="h-[70vh] mx-auto"
      ></iframe>
      <BigText color="accent">
        If there is anything not on here you'd like to see{" "}
        <StyledLink href="/contact" text="get in touch" />.
      </BigText>
    </>
  );
}
