import PageHeader from "~/app/components/_layouts/pageHeader";

export default async function Puzzles() {
  return (
    <>
      <PageHeader
        title="Puzzle Training"
        subTitle="Coming soon!"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
    </>
  );
}
