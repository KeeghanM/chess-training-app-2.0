export default function Heading(props: {
  children: React.ReactNode;
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  color?: string;
}) {
  switch (props.as) {
    case "h1":
      return (
        <h1
          className={
            "text-3xl md:text-4xl font-bold mb-2 " +
            (props.color ?? "text-purple-700")
          }
        >
          {props.children}
        </h1>
      );
    case "h2":
      return (
        <h2
          className={
            "text-2xl md:text-3xl font-bold mb-2 mt-4 " +
            (props.color ?? "text-gray-700")
          }
        >
          {props.children}
        </h2>
      );
    case "h3":
      return (
        <h3
          className={
            "text-xl md:text-2xl font-bold mb-2 mt-4 " +
            (props.color ?? "text-orange-500")
          }
        >
          {props.children}
        </h3>
      );
    case "h4":
      return (
        <h4
          className={
            "text-xl md:text-lg font-bold  mb-2 mt-4" +
            (props.color ?? "text-purple-700")
          }
        >
          {props.children}
        </h4>
      );
  }
}
