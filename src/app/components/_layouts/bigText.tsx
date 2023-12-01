interface BigTextProps {
  color: "primary" | "secondary" | "accent";
  children: React.ReactNode;
}

export default function BigText(props: BigTextProps) {
  const colourString = {
    primary: "bg-purple-700",
    secondary: "bg-gray-700",
    accent: "bg-orange-500",
  };
  return (
    <div
      className={
        "flex w-full items-center justify-center " + colourString[props.color]
      }
    >
      <p className="text-3xl md:text-5xl font-bold text-white px-4 md:px-6 lg:px-12 py-6 md:py-12 !leading-none text-center">
        {props.children}
      </p>
    </div>
  );
}
