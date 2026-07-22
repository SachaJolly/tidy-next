import { create } from 'storybook/theming';

export const theme = create({
  base: 'light',

  // Branding
  brandTitle: 'TidyCards',
  brandUrl: '/',
  brandTarget: '_self',

  // Typography
  fontBase: '"IBM Plex Sans", Helvetica, sans-serif',
  fontCode: '"IBM Plex Mono", monospace',

  // Colors — purple primary
  colorPrimary: 'hsl(245, 100%, 68%)',
  colorSecondary: 'hsl(245, 100%, 68%)',

  // UI
  appBg: 'hsl(0, 0%, 94%)',
  appContentBg: 'hsl(0, 0%, 100%)',
  appPreviewBg: 'hsl(0, 0%, 100%)',
  appBorderColor: 'hsla(0, 0%, 0%, 0.1)',
  appBorderRadius: 8,

  // Text
  textColor: 'hsl(0, 0%, 13%)',
  textInverseColor: 'hsl(0, 0%, 100%)',
  textMutedColor: 'hsl(0, 0%, 47%)',

  // Toolbar
  barTextColor: 'hsl(0, 0%, 27%)',
  barHoverColor: 'hsl(245, 100%, 68%)',
  barSelectedColor: 'hsl(245, 100%, 68%)',
  barBg: 'hsl(0, 0%, 100%)',

  // Form inputs
  inputBg: 'hsl(0, 0%, 100%)',
  inputBorder: 'hsla(0, 0%, 0%, 0.2)',
  inputTextColor: 'hsl(0, 0%, 13%)',
  inputBorderRadius: 8,
});

export const darkTheme = create({
  base: 'dark',

  brandTitle: 'TidyCards',
  brandUrl: '/',
  brandTarget: '_self',

  fontBase: '"IBM Plex Sans", Helvetica, sans-serif',
  fontCode: '"IBM Plex Mono", monospace',

  colorPrimary: 'hsl(245, 100%, 75%)',
  colorSecondary: 'hsl(245, 100%, 75%)',

  appBg: 'hsl(0, 0%, 7%)',
  appContentBg: 'hsl(0, 0%, 13%)',
  appPreviewBg: 'hsl(0, 0%, 13%)',
  appBorderColor: 'hsla(0, 0%, 100%, 0.1)',
  appBorderRadius: 8,

  textColor: 'hsl(0, 0%, 100%)',
  textInverseColor: 'hsl(0, 0%, 13%)',
  textMutedColor: 'hsl(0, 0%, 73%)',

  barTextColor: 'hsl(0, 0%, 88%)',
  barHoverColor: 'hsl(245, 100%, 75%)',
  barSelectedColor: 'hsl(245, 100%, 75%)',
  barBg: 'hsl(0, 0%, 16%)',

  inputBg: 'hsl(0, 0%, 19%)',
  inputBorder: 'hsla(0, 0%, 100%, 0.2)',
  inputTextColor: 'hsl(0, 0%, 100%)',
  inputBorderRadius: 8,
});
