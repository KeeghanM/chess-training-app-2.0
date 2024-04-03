export default function Heading(props: {
  children: React.ReactNode
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  color?: string
  bold?: boolean
}) {
  const bold = props.bold ?? true
  switch (props.as) {
    case 'h1':
      return (
        <h1
          className={
            'mb-2 text-3xl font-bold md:text-4xl flex items-center gap-1 flex-wrap ' +
            (props.color ?? 'text-purple-700')
          }
        >
          {props.children}
        </h1>
      )
    case 'h2':
      return (
        <h2
          className={
            'mb-2 mt-4 text-2xl md:text-3xl ' +
            (props.color ?? 'text-gray-700') +
            (bold ? ' font-bold' : '')
          }
        >
          {props.children}
        </h2>
      )
    case 'h3':
      return (
        <h3
          className={
            'mb-2 mt-4 text-xl font-bold md:text-2xl ' +
            (props.color ?? 'text-orange-500')
          }
        >
          {props.children}
        </h3>
      )
    case 'h4':
      return (
        <h4
          className={
            'mb-2 text-xl font-bold  md:text-lg ' +
            (props.color ?? 'text-purple-700')
          }
        >
          {props.children}
        </h4>
      )
  }
}
