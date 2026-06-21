import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "./global-components.css";
import { Button, Text, TextInput } from "./primitive";

interface SignUpLocationState {
  message?: string;
}

export default function SignUpForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const initialMessage =
    (location.state as SignUpLocationState | null)?.message ?? null;

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(initialMessage);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await signup({ email, displayName, password });
      navigate("/chat", { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === "account_exists") {
          setMessage(err.message);
          return;
        }
        if (err.code === "not_whitelisted") {
          setMessage(err.message);
          return;
        }
        setMessage(err.message);
        return;
      }
      setMessage("Unable to sign up. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="component-sign-in-form" onSubmit={handleSubmit}>
      {message ? (
        <Text className="component-form-message component-form-message--notice">
          {message}
        </Text>
      ) : null}
      <TextInput
        variant="default"
        name="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <TextInput
        variant="default"
        name="displayName"
        placeholder="Display name..."
        icon="user-3-line"
        autoComplete="name"
        value={displayName}
        onChange={(event) => setDisplayName(event.target.value)}
        required
      />
      <TextInput
        variant="password"
        name="password"
        autoComplete="new-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />
      <Button variant="primary" type="submit" disabled={submitting}>
        Sign Up
      </Button>
      <Button
        variant="secondary"
        narrow
        type="button"
        onClick={() => navigate("/signin")}
      >
        Sign In
      </Button>
    </form>
  );
}
