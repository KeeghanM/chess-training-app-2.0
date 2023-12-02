import NumberIcon from "~/app/components/general/NumberIcon";

export default function Steps(props: { currentStep: string }) {
  const { currentStep } = props;

  return (
    <div className="w-max mx-auto my-4">
      <div className="flex gap-4 items-center mx-auto">
        <div className="flex flex-col md:flex-row gap-1 items-center">
          <NumberIcon number={1} active={currentStep == "name"} />
          <p className="text-sm">Name & Details</p>
        </div>
        <div className="flex flex-col md:flex-row  gap-1 items-center">
          <NumberIcon number={2} active={currentStep == "import"} />
          <p className="text-sm">Import PGN</p>
        </div>
        <div className="flex flex-col md:flex-row  gap-1 items-center">
          <NumberIcon number={3} active={currentStep == "group"} />
          <p className="text-sm">Select Grouping</p>
        </div>
      </div>
    </div>
  );
}
