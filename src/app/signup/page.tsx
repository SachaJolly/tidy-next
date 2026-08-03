"use client";

import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Page from '@/app/layouts/page';
import Auth from '@/app/layouts/auth';
import Button from '@/components/button/button';
import Input from '@/components/input/input';
import Link from 'next/link';
import { signupAction } from '@/app/actions/auth';
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';

export default function SignupPage() {
  const t = useTranslations('Auth');
  const locale = useLocale();
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
      setError(t('passwordsDoNotMatch'));
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
      router.push(localizePath(result.redirectTo ?? '/dashboard', locale));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      if (!navigationStarted) setIsLoading(false);
    }
  }, [locale, username, email, password, passwordConfirmation, router, searchParams]);

  return (
    <Page>
      <Auth>
        <div>
          <h2 className="h3 text-center mb-16px">{t('signupTitle')}</h2>
          <p className="text-center">{t('signupSubtitle')}</p>
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
            placeholder={t('usernamePlaceholder')}
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
            placeholder={t('emailPlaceholder')}
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
            placeholder={t('passwordPlaceholder')}
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
            placeholder={t('repeatPasswordPlaceholder')}
            autoComplete="new-password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            disabled={isLoading}
            required
          />

          {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

          <Button type="submit" variant="interactive" disabled={isLoading}>
            {isLoading ? t('creatingAccount') : t('createAccount')}
          </Button>
        </form>

        <p className="text-small text-muted text-center">
          {t('termsAcknowledgement')}
        </p>

        <div className="text-center py-24px">
          <span className="text-bold">{t('alreadyMember')} <Link href={localizePath('/signin', locale)}>{t('signinButton')}</Link></span>
        </div>
      </Auth>
    </Page>
  );
}
