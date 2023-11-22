export default function NumberIcon(props: { number: number; color?: string }) {
  return (
    <div
      style={{
        color: props.color || "inherit",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "2rem",
        height: "2rem",
        fontSize: "1.5rem",
        fontWeight: "bold",
        borderRadius: "9999px",
        border: "2px solid",
      }}
    >
      {props.number}
    </div>
  );
}
