"use client";

import { Loader2, LogIn, UserPlus } from "lucide-react";
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

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const { error: signInError } = await authClient.signIn.email({
      email,
      password,
      callbackURL: "/chat",
    });

    setIsSubmitting(false);

    if (signInError) {
      setError(
        signInError.message ?? "Unable to sign in. Check your credentials.",
      );
      return;
    }

    router.push("/chat");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Chatterbox</CardTitle>
        <CardDescription>
          Sign in to continue to your workspace.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
              <Input
                id="sign-in-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
              <Input
                id="sign-in-password"
                type="password"
                autoComplete="current-password"
                required
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
                <LogIn data-icon="inline-start" />
              )}
              Sign in
            </Button>
            <Button
              type="button"
              variant={tertiaryIntent.buttonVariant}
              className={tertiaryIntent.className}
              disabled={isSubmitting}
              onClick={() => router.push("/signup")}
            >
              <UserPlus data-icon="inline-start" />
              Create account
            </Button>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center border-t-0 bg-transparent">
        <p className="text-center text-sm text-muted-foreground">
          Need an account?{" "}
          <Link
            className="text-primary underline underline-offset-4 hover:text-primary/80"
            href="/signup"
          >
            Go to sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
