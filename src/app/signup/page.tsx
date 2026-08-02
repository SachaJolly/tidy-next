"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Page from '@/app/layouts/page';
import Auth from '@/app/layouts/auth';
import Button from '@/components/button/button';
import Input from '@/components/input/input';
import Link from 'next/link';
import { signupAction } from '@/app/actions/auth';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const usernameValue             = (data.get('username')             as string) || username;
    const emailValue                = (data.get('email')                as string) || email;
    const passwordValue             = (data.get('password')             as string) || password;
    const passwordConfirmationValue = (data.get('password_confirmation') as string) || passwordConfirmation;

    if (passwordValue !== passwordConfirmationValue) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsLoading(true);

    let navigationStarted = false;

    try {
      const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
      const result = await signupAction(
        usernameValue,
        emailValue,
        passwordValue,
        passwordConfirmationValue,
        callbackUrl,
      );

      if (result.error) {
        throw new Error(result.error);
      }

      navigationStarted = true;
      router.refresh();
      router.push(result.redirectTo ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      if (!navigationStarted) setIsLoading(false);
    }
  }, [username, email, password, passwordConfirmation, router, searchParams]);

  return (
    <Page>
      <Auth>
        <div>
          <h2 className="h3 text-center mb-16px">Join today</h2>
          <p className="text-center">
            Create your account today to start organizing your lists.
          </p>
        </div>

        <form
          ref={formRef}
          id="signup-form"
          onSubmit={handleSubmit}
          autoComplete="on"
          style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}
        >
          <Input
            id="signup-username"
            name="username"
            type="text"
            placeholder="Username"
            autoComplete="username"
            autoFocus={true}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            id="signup-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            id="signup-password-confirmation"
            name="password_confirmation"
            type="password"
            placeholder="Repeat password"
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isLoading}
            required
          />

          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

          <Button type="submit" variant="interactive" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-small text-muted text-center">
          By clicking "Create account" above, you acknowledge that you have read, understood, and agreed to TidyCards' Terms and Privacy Policy.
        </p>

        <div className="text-center py-24px">
          <span className="text-bold">Already a member? <Link href="/signin">Sign in</Link></span>
        </div>
      </Auth>
    </Page>
  );
}
