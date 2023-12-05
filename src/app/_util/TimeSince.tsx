import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);
import ReactTimeAgo from "react-time-ago";

export default function TimeSince(props: { date: Date }) {
  return (
    <>
      <ReactTimeAgo date={props.date} timeStyle="twitter" /> ago.
    </>
  );
}
