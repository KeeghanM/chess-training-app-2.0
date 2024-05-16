interface BigTextProps {
  color: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export function BigText({ color, size = 'medium', children }: BigTextProps) {
  const colourString = {
    primary: 'bg-purple-700',
    secondary: 'bg-gray-700',
    accent: 'bg-orange-500',
  };

  const sizeString = {
    small: 'text-xl md:text-3xl',
    medium: 'text-2xl md:text-4xl',
    large: 'text-3xl md:text-5xl lg:px-12',
  };

  return (
    <div
      className={`flex w-full items-center justify-center ${colourString[color]}`}
    >
      <p
        className={
          'px-4 py-6 text-center font-bold !leading-none text-white md:px-6 md:py-12 ' +
          sizeString[size]
        }
      >
        {children}
      </p>
    </div>
  );
}
