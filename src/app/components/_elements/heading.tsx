export function Heading({
  children,
  as,
  color,
  bold = true,
}: {
  children: React.ReactNode;
  as: 'h1' | 'h2' | 'h3' | 'h4';
  color?: string;
  bold?: boolean;
}) {
  switch (as) {
    case 'h1':
      return (
        <h1
          className={`mb-2 flex flex-wrap items-center gap-1 text-3xl font-bold md:text-4xl ${
            color ?? 'text-purple-700'
          }`}
        >
          {children}
        </h1>
      );
    case 'h2':
      return (
        <h2
          className={`mb-2 mt-4 text-2xl md:text-3xl ${
            color ?? 'text-gray-700'
          }${bold ? ' font-bold' : ''}`}
        >
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3
          className={`mb-2 mt-4 text-xl font-bold md:text-2xl ${
            color ?? 'text-orange-500'
          }`}
        >
          {children}
        </h3>
      );
    case 'h4':
      return (
        <h4
          className={`mb-2 text-xl font-bold  md:text-lg ${
            color ?? 'text-purple-700'
          }`}
        >
          {children}
        </h4>
      );
  }
}
