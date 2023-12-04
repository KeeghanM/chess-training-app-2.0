import PageHeader from "~/app/components/_layouts/pageHeader";

export default function KnightVision() {
  return (
    <>
      <PageHeader
        title="Knight Vision"
        subTitle="Coming soon!"
        image={{
          src: "/images/hero.avif",
          alt: "Hero Image",
        }}
      />
    </>
  );
}
