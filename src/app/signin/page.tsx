'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AuthLayout from '@/layouts/AuthLayout/AuthLayout';
import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';
import Link from 'next/link';
import { signinAction } from '@/actions/auth';
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';

export default function SigninPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const data = new FormData(e.currentTarget);
      const emailValue = (data.get('email') as string) || email;
      const passwordValue = (data.get('password') as string) || password;

      setError(null);
      setIsLoading(true);

      let navigationStarted = false;

      try {
        const callbackUrl = searchParams.get('callbackUrl') ?? undefined;
        const result = await signinAction(emailValue, passwordValue, callbackUrl);

        if (result.error) {
          throw new Error(result.error);
        }

        navigationStarted = true;
        // BUG FIX 1: Use the returned user language instead of stale useLocale()
        // This ensures redirect uses the correct language from the user's DB profile
        const userLanguage = result.userLanguage ?? locale;
        router.refresh();
        router.push(localizePath(result.redirectTo ?? '/dashboard', userLanguage));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        if (!navigationStarted) setIsLoading(false);
      }
    },
    [email, password, locale, router, searchParams],
  );

  return (
    <AuthLayout>
      <div>
        <h2 className="h3 text-center mb-16px">{t('signinTitle')}</h2>
        <p className="text-center">{t('signinSubtitle')}</p>
      </div>

      <form
        ref={formRef}
        id="signin-form"
        onSubmit={handleSubmit}
        autoComplete="on"
        style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}
      >
        <Input
          id="signin-email"
          name="email"
          type="email"
          placeholder={t('emailPlaceholder')}
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
          placeholder={t('passwordPlaceholder')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

        <Button type="submit" variant="interactive" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signinButton')}
        </Button>
      </form>

      <div className="text-center py-24px">
        <span className="text-bold">
          {t('notMemberYet')} <Link href={localizePath('/signup', locale)}>{t('joinToday')}</Link>
        </span>
      </div>
    </AuthLayout>
  );
}
