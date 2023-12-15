import Container from '../_elements/container'
import Heading from '../_elements/heading'

interface TextWallProps {
  title: string
  background: 'light' | 'dark'
  children: React.ReactNode
}

export function TextWall(props: TextWallProps) {
  return (
    <div
      className={`w-full py-6 ${
        props.background === 'light' ? 'bg-white' : 'bg-purple-100'
      }`}
    >
      <Container>
        <Heading as={'h2'}>{props.title}</Heading>
        <div className="flex flex-col gap-4 md:flex-row md:gap-6">
          {props.children}
        </div>
      </Container>
    </div>
  )
}
