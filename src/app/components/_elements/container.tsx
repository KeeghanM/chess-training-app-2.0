export default function Container({
  children,
  size,
}: {
  children: React.ReactNode
  size?: 'default' | 'wide'
}) {
  return (
    <div
      className={
        'relative mx-auto p-4 md:p-6 lg:p-8' +
        (size == 'default' || size == undefined
          ? '  max-w-[min(calc(100vw-1rem),90ch)]'
          : ' max-w-[min(calc(100vw-1rem),120ch)]')
      }
    >
      {children}
    </div>
  )
}
