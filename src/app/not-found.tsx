import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { type } from "@/lib/scale";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center py-16">
      <Container className="max-w-2xl">
        <h1 className={type.h1}>We could not find that page</h1>
        <p className={`${type.lead} mb-8 mt-3`}>The link may be old, or the booking or service may have been removed.</p>
        <ButtonLink href="/">Go to the home page</ButtonLink>
      </Container>
    </main>
  );
}
