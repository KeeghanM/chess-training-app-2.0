import Container from "../_elements/container";
import PageHeader from "../_layouts/pageHeader";

export default function Error(props: { PageTitle: string; error?: string }) {
  // TODO: Add error logging to the server
  return (
    <>
      <PageHeader
        title="Oops! Something went wrong."
        image={{ src: "/images/hero.avif", alt: "Oops! Something went wrong." }}
        subTitle={props.error}
      />
      <Container>
        <p>
          We're sorry, but something went wrong. Please try again later, or{" "}
          <a href="mailto:support@chesstraining.app">contact support</a> if the
          problem persists.
        </p>
      </Container>
    </>
  );
}
