"use client";

import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Intent } from "@/lib/Intent";
import { intentVariants } from "@/lib/intent-variants";

const tertiaryIntent = intentVariants(Intent.TERTIARY);

function isNotWhitelistedError(error: {
  message?: string;
  code?: string;
  status?: number;
}): boolean {
  return (
    error.code === "NOT_WHITELISTED" ||
    error.status === 403 ||
    (error.message?.toLowerCase().includes("whitelisted") ?? false)
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signUpError } = await authClient.signUp.email({
      email,
      password,
      name: username,
      username,
      callbackURL: "/chat",
    });

    setIsSubmitting(false);

    if (signUpError) {
      if (isNotWhitelistedError(signUpError)) {
        router.replace("/?auth=not-whitelisted");
        return;
      }

      setError(signUpError.message ?? "Unable to create your account.");
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Create account</CardTitle>
        <CardDescription>
          Choose a username and password. Access is limited to whitelisted
          emails.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
              <Input
                id="sign-up-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sign-up-username">Username</FieldLabel>
              <Input
                id="sign-up-username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                maxLength={30}
                pattern="[A-Za-z0-9_.]+"
                title="Use letters, numbers, underscores, or dots."
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
              <Input
                id="sign-up-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
          </FieldGroup>

          {error ? <FieldError>{error}</FieldError> : null}

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin" data-icon="inline-start" />
              ) : (
                <UserPlus data-icon="inline-start" />
              )}
              Sign up
            </Button>
            <Button
              type="button"
              variant={tertiaryIntent.buttonVariant}
              className={tertiaryIntent.className}
              disabled={isSubmitting}
              onClick={() => router.push("/")}
            >
              <ArrowLeft data-icon="inline-start" />
              Back to sign in
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t-0 bg-transparent">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            href="/"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
