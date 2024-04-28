'use client'

import type {
  Course,
  Group,
  Line,
  Move,
  UserCourse,
  UserLine,
} from '@prisma/client'

import Button from '~/app/components/_elements/button'
import PrettyPrintLine from '~/app/components/general/PrettyPrintLine'
import type { Line as NiceLine } from '~/app/components/training/courses/create/parse/ParsePGNtoLineData'

type UserLineWithData = UserLine & {
  line: Line & {
    group: Group
    moves: Move[]
  }
}

type CourseScheduleProps = {
  userLines: UserLineWithData[]
}
export default function CourseSchedule({ userLines }: CourseScheduleProps) {
  const LineRow = ({ line }: { line: UserLineWithData }) => {
    const niceLine = {
      moves: line.line.moves.map((move) => ({
        notation: move.move,
        turn: '',
      })),
    } as NiceLine

    const status: 'unseen' | 'learning' | 'learned' | 'hard' = (() => {
      if (line.timesTrained === 0) return 'unseen'
      if (line.currentStreak > 4 && line.timesCorrect >= line.timesWrong)
        return 'learned'
      if (
        line.currentStreak <= 4 &&
        line.timesTrained > 0 &&
        line.timesCorrect >= line.timesWrong
      )
        return 'learning'
      if (line.timesWrong > line.timesCorrect) return 'hard'
      return 'unseen'
    })()

    return (
      <div
        className={
          'border-4 bg-purple-700 bg-opacity-20 text-black dark:text-white py-2 flex flex-col md:flex-row gap-2 justify-between ' +
          (status === 'unseen' ? 'border-gray-300' : '') +
          (status === 'learning' ? 'border-blue-600' : '') +
          (status === 'learned' ? 'border-green-500' : '') +
          (status === 'hard' ? 'border-red-500' : '')
        }
      >
        <div className="px-2">
          <h3 className="text-sm border-b w-full mb-2 text-orange-500 italic">
            {line.line.group.groupName}
          </h3>
          <div className="text-sm">
            <PrettyPrintLine line={niceLine} />
          </div>
        </div>
        <div className="flex flex-col justify-center items-center border-t pt-2 mx-2 md:border-t-0 md:border-l md:pl-4 md:ml-0 md:min-w-fit">
          <div>
            {line.revisionDate?.toLocaleTimeString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            }) ?? 'Not yet seen'}
          </div>
          <Button variant="primary">Mark for Review</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {userLines
        .sort((a, b) => {
          // sort lines by revision date, and then by their group's sortOrder and then by their own sortOrder
          if (a.revisionDate || b.revisionDate) {
            if ((a.revisionDate ?? Infinity) < (b.revisionDate ?? Infinity))
              return -1
            if ((a.revisionDate ?? Infinity) > (b.revisionDate ?? Infinity))
              return 1
          }
          if (a.line.group.sortOrder < b.line.group.sortOrder) return -1
          if (a.line.group.sortOrder > b.line.group.sortOrder) return 1
          if (a.line.sortOrder < b.line.sortOrder) return -1
          if (a.line.sortOrder > b.line.sortOrder) return 1
          return 0
        })
        .map((line) => (
          <LineRow key={line.id} line={line} />
        ))}
    </div>
  )
}
