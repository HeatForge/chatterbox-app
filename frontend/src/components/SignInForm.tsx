import "./global-components.css";
import { Button, TextInput } from "./primitive";

export default function SignInForm() {
  return (
    <form className="component-sign-in-form" onSubmit={(e) => e.preventDefault()}>
      <TextInput variant="default" name="email" autoComplete="email" />
      <TextInput
        variant="password"
        name="password"
        autoComplete="current-password"
      />
      <Button variant="primary" type="submit">
        Sign In
      </Button>
      <Button variant="secondary" narrow type="button">
        Sign Up
      </Button>
    </form>
  );
}
