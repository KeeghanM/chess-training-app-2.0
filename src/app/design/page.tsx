import Button from "../components/_elements/button";
import Container from "../components/_elements/container";
import Heading from "../components/_elements/heading";
import StyledLink from "../components/_elements/styledLink";

export default function Design() {
  return (
    <>
      <Container>
        <div className="flex flex-wrap gap-4">
          <Button text="Primary" variant="primary" />
          <Button text="Secondary" variant="secondary" />
          <Button text="Accent" variant="accent" />
          <Button text="Tertiary" variant="tertiary" />
          <Button text="Danger" variant="danger" />
          <Button text="Warning" variant="warning" />
          <Button text="Success" variant="success" />
          <Button text="Info" variant="info" />
        </div>
      </Container>
      <Container>
        <Heading as="h1">Heading 1</Heading>
        <p>
          Here we have a <StyledLink href="#" text="styled link" /> which is a
          wrapper around a Next.js Link component. This ensures that the link is
          styled the same way throughout the app.
        </p>
        <Heading as="h2">Heading 2</Heading>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
          distinctio, nemo dolorem atque quam, iure architecto ipsa ad
          temporibus veniam vitae recusandae aspernatur. Placeat voluptatum
          dignissimos, itaque atque eius iste?
        </p>
        <Heading as="h3">Heading 3</Heading>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
          distinctio, nemo dolorem atque quam, iure architecto ipsa ad
          temporibus veniam vitae recusandae aspernatur. Placeat voluptatum
          dignissimos, itaque atque eius iste?
        </p>
        <Heading as="h4">Heading 4</Heading>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
          distinctio, nemo dolorem atque quam, iure architecto ipsa ad
          temporibus veniam vitae recusandae aspernatur. Placeat voluptatum
          dignissimos, itaque atque eius iste?
        </p>
        <Heading as="h5">Heading 5</Heading>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
          distinctio, nemo dolorem atque quam, iure architecto ipsa ad
          temporibus veniam vitae recusandae aspernatur. Placeat voluptatum
          dignissimos, itaque atque eius iste?
        </p>
        <Heading as="h6">Heading 6</Heading>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Officiis
          distinctio, nemo dolorem atque quam, iure architecto ipsa ad
          temporibus veniam vitae recusandae aspernatur. Placeat voluptatum
          dignissimos, itaque atque eius iste?
        </p>
      </Container>
    </>
  );
}
