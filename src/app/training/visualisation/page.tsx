import PageHeader from "~/app/components/_layouts/pageHeader";

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
    </>
  );
}
