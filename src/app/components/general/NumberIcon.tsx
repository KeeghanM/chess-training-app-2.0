export default function NumberIcon(props: { number: number; active: boolean }) {
  return (
    <div
      className={
        "bg-none flex items-center justify-center w-8 h-8 text-lg font-bold border-2" +
        (props.active
          ? " border-purple-700 text-purple-700"
          : " border-gray-300 text-gray-300")
      }
    >
      {props.number}
    </div>
  );
}
