import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en.json'
import ReactTimeAgo from 'react-time-ago'

TimeAgo.addDefaultLocale(en)

export default function TimeSince(props: { date: Date; text?: string }) {
  return (
    <>
      <ReactTimeAgo date={props.date} timeStyle="twitter" /> {props.text}
    </>
  )
}
