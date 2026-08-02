"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Page from '@/app/layouts/page';
import Auth from '@/app/layouts/auth';
import Button from '@/components/button/button';
import Input from '@/components/input/input';
import Link from 'next/link';
import { signinAction } from '@/app/actions/auth';

export default function SigninPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Stable ref so password managers can re-query the form by id if their
  // cached DOM reference becomes stale (e.g. after a React StrictMode remount).
  const formRef = useRef<HTMLFormElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // useCallback gives the handler a stable reference so the <form onSubmit>
  // prop never changes between renders — avoids unnecessary reconciliation
  // that could cause password managers to see a different form object.
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    // Must be the very first synchronous call. Calling it after any await
    // means the browser's default form submission has already fired,
    // disconnecting the form from the DOM ("form is not connected" crash).
    e.preventDefault();

    // Password managers set input.value via direct DOM assignment, bypassing
    // React's synthetic onChange. FormData reads actual DOM values regardless
    // of how they were set; React state is kept as a fallback for typed input.
    const data = new FormData(e.currentTarget);
    const emailValue    = (data.get('email')    as string) || email;
    const passwordValue = (data.get('password') as string) || password;

    setError(null);
    setIsLoading(true);

    // Set before calling router.push() so the finally block can skip the
    // loading reset on the success path and avoid a re-render race.
    let navigationStarted = false;

    try {
      const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
      const result = await signinAction(emailValue, passwordValue, callbackUrl);

      if (result.error) {
        throw new Error(result.error);
      }

      navigationStarted = true;
      router.refresh();
      router.push(result.redirectTo ?? '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      // Error path only: reset loading so the user can retry.
      // Success path: leave isLoading=true — the button stays locked while
      // the route transition plays out and the component unmounts.
      if (!navigationStarted) setIsLoading(false);
    }
  }, [email, password, router, searchParams]);

  return (
    <Page>
      <Auth>
        <div>
          <h2 className="h3 text-center mb-16px">Sign in to manage your lists</h2>
          <p className="text-center">
            Sign in to your account to share your passions and interests with the world.
          </p>
        </div>

        {/*
          The <form> is always present and never conditionally rendered during
          loading — structural DOM stability is required for password manager
          compatibility. Loading state is expressed only via `disabled` on the
          interactive elements; the form node itself never changes.
        */}
        <form
          ref={formRef}
          id="signin-form"
          onSubmit={handleSubmit}
          autoComplete="on"
          style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}
        >
          {/*
            `name` is required for FormData indexing and for password managers
            to recognise which credential goes in which input.
            `autoComplete="current-password"` signals this is a sign-in form,
            not a registration form, preventing a new-password suggestion.
          */}
          <Input
            id="signin-email"
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            autoFocus={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input
            id="signin-password"
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />

          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

          <Button type="submit" variant="interactive" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center py-24px">
          <span className="text-bold">Not a member yet? <Link href="/signup">Join today</Link></span>
        </div>
      </Auth>
    </Page>
  );
}
