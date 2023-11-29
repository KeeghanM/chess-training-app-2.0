"use client";

interface ButtonProps {
  func?: () => void;
  text: string;
  variant:
    | "primary"
    | "secondary"
    | "accent"
    | "tertiary"
    | "danger"
    | "warning"
    | "success"
    | "info";
}
export default function Button(props: ButtonProps) {
  const styles = {
    primary:
      "bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 px-6 ",
    secondary: "bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 ",
    accent: "bg-orange-500 hover:bg-orange-400 text-white font-bold py-2 px-6 ",
    tertiary:
      "bg-none underline text-gray-700 hover:text-purple-700 font-bold py-2 px-6 ",
    danger: "bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6",
    warning:
      "bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-2 px-6 ",
    success: "bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 ",
    info: "bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-6 ",
  };

  return (
    <button
      className={styles[props.variant]}
      onClick={props.func ? props.func : undefined}
    >
      {props.text}
    </button>
  );
}
