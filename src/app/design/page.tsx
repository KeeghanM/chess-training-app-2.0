import Button from "../components/_elements/button";
import Container from "../components/_elements/container";

export default function Design() {
  return (
    <Container>
      <Button text="Primary" variant="primary" />
      <Button text="Secondary" variant="secondary" />
      <Button text="Accent" variant="accent" />
      <Button text="Tertiary" variant="tertiary" />
      <Button text="Danger" variant="danger" />
      <Button text="Warning" variant="warning" />
      <Button text="Success" variant="success" />
      <Button text="Info" variant="info" />
    </Container>
  );
}
