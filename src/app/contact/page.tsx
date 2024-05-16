import { Container } from '@/app/components/_elements/container';
import { Heading } from '@/app/components/_elements/heading';
import { ContactForm } from '@/app/components/contact/contact-form';

export const metadata = {
  title: 'Get in touch with the team at ChessTraining.app',
};

export default function ContactPage() {
  return (
    <Container>
      <Heading as="h1">Contact Us</Heading>
      <p className="mb-4">
        We&amp;d love to hear from you! If you have any questions, comments, or
        concerns, please don&amp;t hesitate to reach out.
      </p>
      <ContactForm />
    </Container>
  );
}
