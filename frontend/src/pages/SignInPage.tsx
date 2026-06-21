import SignInForm from "../components/SignInForm";
import { Heading } from "../components/primitive";
import "./global-pages.css";

export default function SignInPage() {
  return (
    <main className="page page-sign-in">
      <div className="page__content">
        <Heading level="banner" className="page-sign-in__title">
          Chatterbox
        </Heading>
        <SignInForm />
      </div>
    </main>
  );
}
