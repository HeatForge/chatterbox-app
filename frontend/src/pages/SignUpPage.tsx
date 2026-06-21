import SignUpForm from "../components/SignUpForm";
import { Heading } from "../components/primitive";
import "./global-pages.css";

export default function SignUpPage() {
  return (
    <main className="page page-sign-in">
      <div className="page__content">
        <Heading level="banner" className="page-sign-in__title">
          Create Account
        </Heading>
        <SignUpForm />
      </div>
    </main>
  );
}
