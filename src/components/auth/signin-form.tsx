"use client";

import React, { useState } from 'react';
import Button from "@/components/button/button";
import Link from "next/link";
import Input from "@/components/input/input";
import { useLocale, useTranslations } from 'next-intl';
import { localizePath } from '@/lib/locale-path';

export default function SigninForm() {
  const locale = useLocale();
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Submitting:", { email, password });
    // API call logic will go here
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <>
      <div>
        <h2 className="h3 text-center mb-16px">{t('signinTitle')}</h2>
        <p className="text-center">{t('signinSubtitle')}</p>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
        <Input
          type="email"
          placeholder={t('emailPlaceholder')}
          autoFocus={true}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder={t('passwordPlaceholder')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="interactive" disabled={isLoading}>
          {isLoading ? t('signingIn') : t('signinButton')}
        </Button>
      </form>
      <div className="text-center py-24px">
        <span className="text-bold">
          {t('notMemberYet')}{' '}
          <Link href={localizePath('/signup', locale)} scroll={false} replace>
            {t('joinToday')}
          </Link>
        </span>
      </div>
    </>
  );
}
