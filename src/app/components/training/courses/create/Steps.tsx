import NumberIcon from '@/app/components/general/NumberIcon'

export default function Steps(props: { currentStep: string }) {
  const { currentStep } = props

  return (
    <div className="mx-auto my-4 w-max dark:text-white">
      <div className="mx-auto flex items-center gap-4">
        <div className="flex flex-col items-center gap-1 md:flex-row">
          <NumberIcon active={currentStep == 'name'} number={1} />
          <p className="text-sm">Name & Details</p>
        </div>
        <div className="flex flex-col items-center  gap-1 md:flex-row">
          <NumberIcon active={currentStep == 'import'} number={2} />
          <p className="text-sm">Import PGN</p>
        </div>
        <div className="flex flex-col items-center  gap-1 md:flex-row">
          <NumberIcon active={currentStep == 'group'} number={3} />
          <p className="text-sm">Select Grouping</p>
        </div>
      </div>
    </div>
  )
}
