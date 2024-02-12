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
        'relative mx-auto py-2 md:py-4 md:px-2 lg:py-6' +
        (size == 'default' || size == undefined
          ? '  max-w-[min(calc(100vw-0.5rem),90ch)]'
          : ' max-w-[min(calc(100vw-0.5rem),120ch)]')
      }
    >
      {children}
    </div>
  )
}
