import NumberIcon from "~/app/components/general/NumberIcon";

export default function Steps(props: { currentStep: string }) {
  const { currentStep } = props;

  return (
    <div className="w-max mx-auto my-4">
      <div className="flex gap-4 items-center mx-auto">
        <div className="flex gap-1 items-center">
          <NumberIcon
            number={1}
            color={
              currentStep == "name" ? "var(--plum-9)" : "rgba(255,255,255,0.5)"
            }
          />
          <p className="text-sm">Name & Details</p>
        </div>
        <div className="flex gap-1 items-center">
          <NumberIcon
            number={2}
            color={
              currentStep == "import"
                ? "var(--plum-9)"
                : "rgba(255,255,255,0.5)"
            }
          />
          <p className="text-sm">Import PGN</p>
        </div>
        <div className="flex gap-1 items-center">
          <NumberIcon
            number={3}
            color={
              currentStep == "group" ? "var(--plum-9)" : "rgba(255,255,255,0.5)"
            }
          />
          <p className="text-sm">Select Grouping</p>
        </div>
      </div>
    </div>
  );
}
