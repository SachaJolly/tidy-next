import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import React, { useState } from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownLabel,
  DropdownSeparator,
  DropdownItem,
  DropdownRadioGroup,
  DropdownRadioItem,
  DropdownSub,
  DropdownSubTrigger,
  DropdownSubContent,
  DropdownSearch,
  DropdownText,
} from '.';
import Icon from '@/components/Icon/Icon';
import NavLink from '@/components/NavLink/NavLink';
import { AccountDropdown } from '@/components/Navbar/AccountDropdown';
import type { User } from '@/lib/types';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta<typeof Dropdown> = {
  title: 'Overlays/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
    docs: {
      description: {
        component:
          'A compound dropdown that renders as a positioned panel on desktop and a bottom drawer on mobile. ' +
          'Portalled to `document.body` to escape `overflow:hidden` parents (including Modals). ' +
          'Supports drill-down sub-menus, search, radio groups, and modal interoperability via `onSelect`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

// ─── Story A: Basic Actions (links + button actions) ─────────────────────────

export const BasicActions: Story = {
  render: () => (
    <Dropdown>
      <DropdownTrigger>
        <Icon name="more" size={20} />
        <span>Options</span>
      </DropdownTrigger>

      <DropdownMenu align="start">
        <DropdownLabel>List actions</DropdownLabel>

        {/* Plain link — href navigates and closes the dropdown */}
        <DropdownItem href="/lists/123" icon="open">
          Open list
        </DropdownItem>
        <DropdownItem icon="edit">Edit details</DropdownItem>
        <DropdownItem icon="share">Share</DropdownItem>
        <DropdownItem icon="copy">Duplicate</DropdownItem>

        <DropdownSeparator />

        <DropdownLabel>Danger zone</DropdownLabel>
        <DropdownItem icon="archive">Archive</DropdownItem>
        {/* destructive prop applies the red danger colour */}
        <DropdownItem icon="delete" destructive>
          Delete list
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

// ─── Story B: Radio Group — dynamic trigger label/icon ───────────────────────
// Demonstrates the polymorphic trigger: the trigger's icon and label update
// live whenever a DropdownRadioItem is selected, without re-mounting.

const VISIBILITY_OPTIONS = [
  {
    value: 'public',
    icon: 'public' as const,
    label: 'Public',
    caption: 'Anyone can see',
  },
  {
    value: 'unindexed',
    icon: 'link' as const,
    label: 'Unindexed',
    caption: 'People with the link can see',
  },
  {
    value: 'private',
    icon: 'private' as const,
    label: 'Private',
    caption: 'Only you and collaborators can see this',
  },
] as const;

export const RadioGroup: Story = {
  name: 'Radio Group (dynamic trigger)',
  render: function Render() {
    const [visibility, setVisibility] = useState<string>('public');
    const selected = VISIBILITY_OPTIONS.find((o) => o.value === visibility)!;

    return (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Visibility:</span>

        {/* The trigger's content (icon + label) re-renders reactively when
            `visibility` state changes — no asChild or forwardRef required. */}
        <Dropdown>
          <DropdownTrigger>
            <Icon name={selected.icon} size={20} />
            <span>{selected.label}</span>
            <Icon name="dropdown" size={16} />
          </DropdownTrigger>

          <DropdownMenu align="start">
            <DropdownLabel>Set visibility</DropdownLabel>
            {/* closeOnSelect={false} keeps the menu open so the user can see
                the checkmark update before dismissing. Default behaviour. */}
            <DropdownRadioGroup value={visibility} onValueChange={setVisibility} label="Visibility">
              {VISIBILITY_OPTIONS.map(({ value, icon, label, caption }) => (
                <DropdownRadioItem
                  key={value}
                  value={value}
                  icon={icon}
                  label={label}
                  caption={caption}
                />
              ))}
            </DropdownRadioGroup>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  },
};

// ─── Story B2: Visibility with captions ──────────────────────────────────────
// Demonstrates label + caption on DropdownItem, e.g. for a visibility picker
// where each option needs a short description below the label.

export const ItemWithCaption: Story = {
  name: 'Item with Caption',
  render: function Render() {
    const [visibility, setVisibility] = useState('public');

    return (
      <Dropdown>
        <DropdownTrigger>
          <Icon name={VISIBILITY_OPTIONS.find((o) => o.value === visibility)!.icon} size={20} />
          <span>{VISIBILITY_OPTIONS.find((o) => o.value === visibility)!.label}</span>
          <Icon name="dropdown" size={16} />
        </DropdownTrigger>

        <DropdownMenu align="start">
          <DropdownLabel>Set visibility</DropdownLabel>
          {VISIBILITY_OPTIONS.map(({ value, icon, label, caption }) => (
            <DropdownItem
              key={value}
              icon={icon}
              label={label}
              caption={caption}
              onSelect={() => setVisibility(value)}
            />
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  },
};

// ─── Story C: Drill-down sub-menu with search ─────────────────────────────────
// Demonstrates navigation into a sub-view that replaces the parent content.
// The Back button (rendered automatically by DropdownMenu) returns to root.

const LISTS = [
  'My Watchlist',
  'Books to Read',
  'Travel Bucket List',
  'Favorite Albums',
  'Movies of the 90s',
  'Must-Try Restaurants',
  'Dev Resources',
  'Gift Ideas',
  'Career Goals',
  'Weekend Plans',
];

export const DrillDownSearch: Story = {
  name: 'Drill-down + Search',
  render: function Render() {
    const [targetList, setTargetList] = useState<string | null>(null);

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
      >
        {targetList && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Moved to: <strong>{targetList}</strong>
          </p>
        )}

        <Dropdown>
          <DropdownTrigger>
            <Icon name="more" size={20} />
            <span>Item options</span>
          </DropdownTrigger>

          <DropdownMenu>
            <DropdownItem icon="edit">Edit item</DropdownItem>
            <DropdownItem icon="copy">Duplicate</DropdownItem>

            <DropdownSeparator />

            {/* DropdownSub groups the trigger and its content.
                `id` is used internally to track which sub-view is active. */}
            <DropdownSub id="move-to">
              {/* Clicking replaces the root view with the sub-menu view.
                  `title` becomes the heading in the auto-rendered back header. */}
              <DropdownSubTrigger icon="move" title="Move to…">
                Move to…
              </DropdownSubTrigger>

              {/* Only rendered when currentView === 'move-to'.
                  Unmounting resets the search query automatically. */}
              <DropdownSubContent>
                {/* DropdownSearch writes to SearchContext, which
                    DropdownRadioItem reads to filter itself. */}
                <DropdownSearch placeholder="Search lists…" />

                <DropdownRadioGroup
                  value={targetList ?? ''}
                  onValueChange={setTargetList}
                  closeOnSelect // close the whole dropdown after picking
                  label="Available lists"
                >
                  {LISTS.map((name) => (
                    <DropdownRadioItem key={name} value={name} icon="list">
                      {name}
                    </DropdownRadioItem>
                  ))}
                </DropdownRadioGroup>
              </DropdownSubContent>
            </DropdownSub>

            <DropdownSeparator />
            <DropdownItem icon="delete" destructive>
              Delete item
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    );
  },
};

// ─── Story D: Modal Interoperability ──────────────────────────────────────────
// Demonstrates onSelect + event.preventDefault() to keep the dropdown mounted
// while a confirmation dialog is shown. The dropdown only closes once the user
// confirms (or the dialog is dismissed intentionally).

export const ModalInteroperability: Story = {
  render: function Render() {
    // Controlled dropdown so external code can close it after confirmation.
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const handleDeleteSelect = (e: Event) => {
      // Prevent the default auto-close so the dropdown stays mounted
      // while the confirmation dialog is visible. Without this call the
      // dropdown would close immediately, potentially confusing the user.
      e.preventDefault();
      setConfirmOpen(true);
    };

    const handleConfirm = () => {
      setDeleted(true);
      setConfirmOpen(false);
      setDropdownOpen(false); // Explicitly close the dropdown after action
    };

    const handleCancelConfirm = () => {
      setConfirmOpen(false);
      // Dropdown intentionally stays open — user might want to pick a
      // different action.
    };

    return (
      <div
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}
      >
        {deleted && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-red-500)' }}>List deleted.</p>
        )}

        <Dropdown open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownTrigger>
            <Icon name="more" size={20} />
            <span>Actions</span>
          </DropdownTrigger>

          <DropdownMenu>
            <DropdownItem icon="edit">Edit</DropdownItem>
            <DropdownItem icon="share">Share</DropdownItem>
            <DropdownSeparator />
            {/*
              onSelect fires before the dropdown closes.
              e.preventDefault() here keeps the dropdown alive — the
              confirmation dialog opens on top of the still-open dropdown.
              The dropdown only closes when handleConfirm sets dropdownOpen=false.
            */}
            <DropdownItem icon="delete" destructive onSelect={handleDeleteSelect}>
              Delete list…
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        {/* Inline confirmation dialog (not the full Modal component, to keep
            the story self-contained and compatible with jsdom in Storybook). */}
        {confirmOpen && (
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,.4)',
              zIndex: 2000,
            }}
          >
            <div
              style={{
                background: 'var(--surface-modal)',
                borderRadius: 'var(--radius-popover)',
                padding: '2rem',
                maxWidth: '360px',
                width: '90%',
                boxShadow: 'var(--shadow-overlay)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <h2 id="confirm-title" style={{ margin: 0, fontSize: '1.125rem' }}>
                Delete this list?
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                This action cannot be undone. All items will be permanently removed.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancelConfirm}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius-interactive)',
                    border: '1px solid var(--border-default)',
                    background: 'var(--surface-highlight)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    color: 'var(--text-body)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  style={{
                    padding: '0.375rem 0.875rem',
                    borderRadius: 'var(--radius-interactive)',
                    border: 'none',
                    background: 'var(--color-red-500)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
};

// ─── Story E: asChild trigger ─────────────────────────────────────────────────
// Demonstrates cloneElement injection into a plain <button>. The trigger
// renders no DOM wrapper — the child becomes the trigger directly.

export const AsChildTrigger: Story = {
  name: 'asChild trigger',
  render: () => (
    <Dropdown>
      {/* asChild clones the child <button> and injects ref, onClick, aria-expanded.
          Use a DOM element or a component using React.forwardRef as the child. */}
      <DropdownTrigger asChild>
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.5rem',
            background: 'none',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-interactive)',
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}
          aria-label="Open options"
        >
          <Icon name="more" size={20} />
        </button>
      </DropdownTrigger>

      <DropdownMenu align="end">
        <DropdownItem icon="settings">Settings</DropdownItem>
        <DropdownItem icon="logout" destructive>
          Sign out
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  ),
};

// ─── Story F: Account Menu ────────────────────────────────────────────────────
// Replicates the full account dropdown:
//   • Custom non-interactive Pro promo header
//   • Account / Switch account (drill-down) / Sign out
//   • Language (drill-down radio group) / Theme (drill-down radio group) / Cookies
//   • Help links with external-link indicator
//   • Muted version footer

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'german', label: 'German - Deutsch' },
  { value: 'french', label: 'French - Français' },
  { value: 'russian', label: 'Russian - Русский' },
  { value: 'spanish', label: 'Spanish - Español' },
];

const THEMES = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

export const AccountMenu: Story = {
  render: function Render() {
    const [language, setLanguage] = useState('english');
    const [theme, setTheme] = useState('dark');

    const currentLanguage = LANGUAGES.find((l) => l.value === language)!;
    const currentTheme = THEMES.find((t) => t.value === theme)!;

    return (
      <Dropdown>
        {/* Simple avatar trigger — replace with <Avatar> in production */}
        <DropdownTrigger asChild>
          <NavLink icon="more" />
        </DropdownTrigger>

        <DropdownMenu align="end">
          <DropdownItem
            icon="subscription"
            label="Get TidyCards Pro"
            caption="Unlock new features like stats and more collections"
          />

          <DropdownSeparator />

          {/* ── Account section ──────────────────────────────────────────── */}
          <DropdownItem icon="settings">Account</DropdownItem>

          {/* Switch account: drill-down with a placeholder list */}
          <DropdownSub id="switch-account">
            <DropdownSubTrigger icon="switch_account" title="Switch account">
              Switch account
            </DropdownSubTrigger>
            <DropdownSubContent>
              <DropdownSeparator />
              <DropdownItem icon="person" disabled>
                No other accounts
              </DropdownItem>
            </DropdownSubContent>
          </DropdownSub>

          <DropdownItem icon="logout" destructive>
            Sign out
          </DropdownItem>

          <DropdownSeparator />

          {/* ── Preferences section ──────────────────────────────────────── */}

          {/* Language drill-down — radio group with live state */}
          <DropdownSub id="language">
            <DropdownSubTrigger icon="language" title="Language">
              Language: {currentLanguage.label}
            </DropdownSubTrigger>
            <DropdownSubContent>
              <DropdownSeparator />
              {/* closeOnSelect closes the whole dropdown once a language is picked */}
              <DropdownRadioGroup
                value={language}
                onValueChange={setLanguage}
                label="Language"
                closeOnSelect
              >
                {LANGUAGES.map(({ value, label }) => (
                  <DropdownRadioItem key={value} value={value} label={label} />
                ))}
              </DropdownRadioGroup>
            </DropdownSubContent>
          </DropdownSub>

          {/* Theme drill-down */}
          <DropdownSub id="theme">
            <DropdownSubTrigger icon="dark_mode" title="Theme">
              Theme: {currentTheme.label}
            </DropdownSubTrigger>
            <DropdownSubContent>
              <DropdownSeparator />
              <DropdownRadioGroup
                value={theme}
                onValueChange={setTheme}
                label="Theme"
                closeOnSelect
              >
                {THEMES.map(({ value, label }) => (
                  <DropdownRadioItem key={value} value={value} label={label} />
                ))}
              </DropdownRadioGroup>
            </DropdownSubContent>
          </DropdownSub>

          <DropdownItem icon="info">Cookie preferences</DropdownItem>

          <DropdownSeparator />

          {/* ── Help section ─────────────────────────────────────────────── */}
          <DropdownItem icon="new">What&apos;s new?</DropdownItem>
          <DropdownItem icon="flag">Send feedback</DropdownItem>

          {/* Help center: external link — `open` icon on the right signals new tab */}
          <DropdownItem icon="help" href="https://help.tidycards.app">
            <span
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Help center
              <Icon name="open" size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </span>
          </DropdownItem>

          <DropdownSeparator />

          {/* ── Version footer (non-interactive) ─────────────────────────── */}
          <DropdownText>
            <span>TidyCards v1.0.0</span>
            <span>Published on Oct 1, 2023</span>
          </DropdownText>
        </DropdownMenu>
      </Dropdown>
    );
  },
};

// ─── AccountDropdown Panel ───────────────────────────────────────────────────

const MOCK_USER: User = {
  id: '1',
  username: 'alexandra',
  email: 'alex.sacha.jolly@gmail.com',
  name: 'Alexandra',
  bio: null,
  createdAt: '2024-01-01T00:00:00.000Z',
};

export const AccountDropdownPanel: Story = {
  name: 'AccountDropdown',
  parameters: { layout: 'centered' },
  render: () => (
    // open={true} keeps the context in "open" state so context-guarded
    // sub-components (DropdownItem, DropdownSeparator, etc.) render correctly.
    // inline bypasses createPortal + fixed positioning so the panel appears
    // directly in the Storybook canvas without needing a trigger element.
    <Dropdown open={true} onOpenChange={() => {}}>
      <AccountDropdown inline user={MOCK_USER} onLogout={() => {}} />
    </Dropdown>
  ),
};
