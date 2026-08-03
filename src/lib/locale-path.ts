export function localizePath(path: string, locale: string, defaultLocale = 'en'): string {
  return path;
}

export function stripLocalePrefix(pathname: string, locale: string, defaultLocale = 'en'): string {
  const localePrefix = `/${locale}`;
  if (pathname === localePrefix) {
    return '/';
  }

  if (pathname.startsWith(`${localePrefix}/`)) {
    const stripped = pathname.slice(localePrefix.length);
    return stripped.length > 0 ? stripped : '/';
  }

  return pathname;
}
