export default function Heading(props: {
  children: React.ReactNode;
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  switch (props.as) {
    case "h1":
      return (
        <h1 className="text-4xl font-bold text-purple-700">{props.children}</h1>
      );
    case "h2":
      return (
        <h2 className="text-3xl font-bold text-gray-700">{props.children}</h2>
      );
    case "h3":
      return (
        <h3 className="text-2xl font-bold text-orange-500">{props.children}</h3>
      );
    case "h4":
      return (
        <h4 className="text-xl font-bold text-purple-700">{props.children}</h4>
      );
    case "h5":
      return (
        <h5 className="text-lg font-bold text-purple-700">{props.children}</h5>
      );
    case "h6":
      return (
        <h6 className="text-base font-bold text-purple-700">
          {props.children}
        </h6>
      );
  }
}
