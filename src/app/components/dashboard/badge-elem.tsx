export const BadgeElem = (name: string, description: string) => {
  return (
    <div key={name}>
      <p className="border border-black bg-purple-700 p-2 font-bold  text-white">
        {name}
      </p>
      <p className="border border-black p-2">{description}</p>
    </div>
  );
};
