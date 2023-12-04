import Button from "../components/_elements/button";
import Container from "../components/_elements/container";
import Heading from "../components/_elements/heading";
import StyledLink from "../components/_elements/styledLink";
import BigText from "../components/_layouts/bigText";
import CtaRow from "../components/_layouts/ctaRow";
import Hero from "../components/_layouts/hero";
import ImageRowFull from "../components/_layouts/imageRowFull";
import { MultiCol, MultiColItem } from "../components/_layouts/multiCol";
import { TextWall } from "../components/_layouts/textWall";

export default function Design() {
  const image = {
    src: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Wooden chess pieces setup in the starting position on a chess board",
  };

  return (
    <>
      <Hero
        title="Style Guide - Elements & Layouts"
        image={image}
        cta={{
          text: "Primary",
          link: "#",
        }}
        secondary={{
          text: "Secondary",
          link: "#",
        }}
      >
        <p>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Provident
          natus quas in facilis. Dolore iure ipsum dolores sunt! Et quo
          recusandae libero voluptatem ipsam eos! Provident impedit ut a est!
        </p>
      </Hero>
      {/* <PageHeader
        title="Style Guide - Elements & Layouts"
        subTitle="This is the design guide page"
        image={image}
      /> */}
      <TextWall title="Text Wall" background="dark">
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente
          eveniet nihil praesentium saepe, fugiat iusto fugit laudantium
          voluptatibus ex? Consequuntur in labore earum repudiandae, ea maxime
          eaque autem blanditiis quia.
        </p>
        <p>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente
          eveniet nihil praesentium saepe, fugiat iusto fugit laudantium
          voluptatibus ex? Consequuntur in labore earum repudiandae, ea maxime
          eaque autem blanditiis quia.
        </p>
      </TextWall>
      <ImageRowFull
        heading="Full Image Row"
        imageSide="left"
        image={image}
        background={"light"}
      >
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, sunt
          quae ex eos nihil veniam perspiciatis cumque delectus ratione optio,
          blanditiis aperiam aliquid suscipit magnam itaque in unde, harum
          explicabo.
        </p>
        <p>
          Lorem ipsum dolor globsit amet consectetur adipisicing elit. Facilis,
          sunt quae ex eos nihil veniam perspiciatis cumque delectus ratione
          optio, blanditiis aperiam aliquid suscipit magnam itaque in unde,
          harum explicabo.
        </p>
        <Heading as="h3">Heading 3</Heading>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, sunt
          quae ex eos nihil veniam perspiciatis cumque delectus ratione optio,
          blanditiis aperiam aliquid suscipit magnam itaque in unde, harum
          explicabo.
        </p>
      </ImageRowFull>
      <ImageRowFull
        heading="Full Image Row Right"
        imageSide="right"
        image={image}
        background={"dark"}
      >
        <Heading as="h3">Heading 3</Heading>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, sunt
          quae ex eos nihil veniam perspiciatis cumque delectus ratione optio,
          blanditiis aperiam aliquid suscipit magnam itaque in unde, harum
          explicabo.
        </p>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, sunt
          quae ex eos nihil veniam perspiciatis cumque delectus ratione optio,
          blanditiis aperiam aliquid suscipit magnam itaque in unde, harum
          explicabo.
        </p>
      </ImageRowFull>
      <BigText color="primary">
        This is an example of a big text element. Punchy. Important.
      </BigText>
      <MultiCol title="Multiple columns, all related" background="light">
        <MultiColItem title="Item 1">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis,
            sunt quae ex eos nihil veniam perspiciatis cumque delectus ratione
            optio, blanditiis aperiam aliquid suscipit magnam itaque in unde,
            harum explicabo.
          </p>
        </MultiColItem>
        <MultiColItem title="Item 1">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis,
            sunt quae ex eos nihil veniam perspiciatis cumque delectus ratione
            optio, blanditiis aperiam aliquid suscipit magnam itaque in unde,
            harum explicabo.
          </p>
        </MultiColItem>
        <MultiColItem title="Item 1">
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis,
            sunt quae ex eos nihil veniam perspiciatis cumque delectus ratione
            optio, blanditiis aperiam aliquid suscipit magnam itaque in unde,
            harum explicabo.
          </p>
        </MultiColItem>
      </MultiCol>
      <CtaRow
        title="Call To Action Row"
        cta={{ text: "Primary", link: "#" }}
        secondary={{ text: "Secondary", link: "#" }}
        background="dark"
      >
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis, sunt
          quae ex eos nihil veniam perspiciatis cumque delectus ratione optio,
          blanditiis aperiam aliquid suscipit magnam itaque in unde, harum
          explicabo.
        </p>
      </CtaRow>
      <Container>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="success">Success</Button>
          <Button variant="info">Info</Button>
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
      </Container>
    </>
  );
}
