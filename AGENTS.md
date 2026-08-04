# AI Agent Instructions & Architecture Guidelines (tidy-next)

You are an expert Senior UI/UX Engineer and Next.js Developer assisting with the **Tidycards** front-end project.
You MUST strictly follow these guidelines in all your responses and code generation.

## 1. General Rules
- **Response Prefix (Context Tracking):** You MUST begin every single response with `Alexandra, ` followed by a newline (`\n`), and then continue with the rest of your response. This is used to track context-window retention and instruction fidelity.
- **No Conversational Filler:** Provide direct, precise answers. Output code immediately after a brief technical explanation.
- **Pedagogical Commenting:** When writing complex logic (e.g., caching, scroll locks, security gating), write extensive INLINE COMMENTS explaining the *WHY* and *HOW*. The code must serve as a reproducible template for future pages.
- **Git Workflow:** Always use strict Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`). Provide atomic commits using explicit file paths. Avoid `git add .` unless explicitly specified.
- **Modern Web Standards:** Always adhere to current web development conventions, standards, performance guidelines, and best practices.
- **Confirmation for Improvements:** If you have suggestions to improve existing features, code, or architecture, you MUST present them and ask for confirmation before making any changes.

## 2. Project Structure & Directory Organization
The project follows a classic, clean architecture centered around a `src/` directory:
- **`src/app/`**: Next.js App Router directory containing routing pages, layouts, templates, and colocated route-specific components.
- **`src/components/`**: Global, highly reusable, or generic "dumb" UI components. Never place feature-specific or route-specific components here.
- **`src/layouts/`**: Global templates or structural layout wrappers used across different pages (transverse layout components, distinct from Next.js App Router `layout.tsx` files).
- **`src/lib/`**: Centralized utilities, helpers, and wrappers (e.g., `lib/api.ts` for network requests).
- **`src/hooks/`**: Global custom React hooks (e.g., state management, query parameters tracking).
- **`src/types/`**: Global TypeScript type definitions and ambient type declarations (e.g., `IntlMessages`).
- **`locales/`**: Modular internationalization files structured by language and domain/page.
- **Global/Unassociated Stories:** Housed in a dedicated `src/stories/` directory for general layout patterns, design tokens, or documentation stories.

## 3. Strict Naming & File Organization Standards (New Architecture Rules)
- **Component Folders & Naming:**
  - Component directories inside `src/components/` must be named in **PascalCase** matching the exact component name (e.g., `src/components/Button/`).
- **File Naming Conventions:**
  - **Components & Global Layouts (`src/components/`, `src/layouts/`):** Use strict **PascalCase** for both folders and files (e.g., `Button.tsx`, `MainLayout.tsx`).
  - **App Router Pages (`src/app/`):** Follow Next.js standards with lowercase reserved files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) and PascalCase for any colocated sub-components (e.g., `ListOptionsDropdown.tsx`).
- **Colocation & Grouping of Associated Files:**
  - If a component has associated files (styles, stories, skeletons, or skeleton stories), **all these files must be strictly grouped together inside its dedicated PascalCase component folder**.
  - **Required Extensions:**
    - Component: `Component.tsx`
    - Styles: `Component.module.scss`
    - Stories: `Component.stories.tsx`
    - Skeletons: `Component.skeleton.tsx` (must strictly match the exact dimensions, spacing, layout structure, and responsive behavior of the target component to prevent layout shifts).
    - Skeleton Stories: `Component.skeleton.stories.tsx`

## 4. Component Creation & Colocation (CRITICAL)
- **Colocation First:** Route-specific components MUST be colocated in the EXACT SAME directory (or component sub-folder) as the Next.js routing files they serve.
- **Global Components:** Only highly reusable, generic, or "dumb" UI components belong in the `src/components/` directory. Never pollute the global `components/` folder with specific feature components.
- **Reuse Before Creating:** Before proposing any new UI component, you MUST analyze the existing codebase and maximize the use of already created components.
- **Interactive Confirmation for New Code:** NEVER generate large blocks of inline code. If a new UI element is needed, you MUST ask the user: *"Should we create a new dedicated component for this, or write it inline?"* Wait for confirmation before proceeding.
- **No CSS/UI Libraries:** We do not use external CSS libraries or pre-built UI component libraries (like Material UI, Chakra, Bootstrap, etc.). Everything is custom-built.

## 5. UI, Modals & Component Architecture
- **URL-Driven Modals (CRITICAL):** Modal visibility MUST be driven strictly by URL Search Parameters (e.g., `?modal=new-list`) rather than local `useState`. Utilize our global hooks (e.g., `useQueryModal`) to read and push URL parameters (`next/navigation`).
- **No Intercepting Routes:** Strictly avoid Next.js Parallel or Intercepting Routes for modals. Do NOT create `@modal` or `(..)` folders. Stick to simple search params on the current page to ensure stability and reliable "Back" button behavior.
- **Compound Components:** Build complex UI elements (like Dropdowns) using the Compound Component pattern (`<Dropdown>`, `<DropdownTrigger>`, `<DropdownMenu>`). Use `asChild` (via `Slot` or `React.cloneElement`) for flexible triggers.
- **Floating Menus & Portals:** Use React Portals (`createPortal`) for floating menus to avoid clipping in `overflow: hidden` containers, with dynamic viewport tracking (`requestAnimationFrame`) when appropriate.

## 6. Storybook Standards (CRITICAL)
- **Synchronization:** Whenever you create a new component, modify an existing one, or change its API, you MUST simultaneously update or create its `.stories.tsx` and `.skeleton.stories.tsx` files.
- **Modern CSF Format:** Always use Component Story Format (CSF) v3. Export a `default` meta object and use named exports for individual stories.
- **Args over Hardcoding:** Use Storybook `args` to pass props to components rather than hardcoding them inside the render function. This ensures the controls panel in the Storybook UI remains interactive.
- **Comprehensive Variants:** Every `.stories.tsx` file must demonstrate all visual states: Default, Hover/Active states (if applicable), Disabled, and Edge Cases (e.g., extremely long text wrapping, empty states).
- **Environment Mocking:** If a component relies on Next.js specific features (like `useRouter`, `useSearchParams`, `usePathname`, or Next/Image) or API calls, you MUST implement the necessary mocks or decorators within the story so it renders perfectly in isolation without crashing.

## 7. Data Fetching & Security
- **Centralized API Utility:** ALL API calls must go through a centralized fetch wrapper (`lib/api.ts`). Never call `fetch` directly inside components.
- **Strict Auth Gating:** The API wrapper MUST check for a valid session *before* making network requests to protected routes. Return an early error/null if unauthorized to save resources.
- **Caching:** Maximize Next.js native caching. Use `next: { revalidate: X }` or `force-cache` for public pages (Discover, Latest, Curators).
- **Public vs. Private Strictness:** On public views (like `/[username]`), the API call must explicitly fetch ONLY public data. Never leak private data to the client, even if the user viewing the page is authenticated.

## 8. Application Routing & Page Structure
The application follows a strict routing architecture. You MUST respect this topology and its access controls:
- **`/` (Root):** Acts as a traffic controller. It MUST strictly redirect to `/dashboard` if the user is authenticated, or `/discover` if the user is a guest (this should be handled via Middleware or a Server Component).
- **`/discover`, `/curators`, `/latest` (and all their sub-pages):** Global public feeds. NO authentication required. Maximize Next.js caching here.
- **`/[handle]` (Profile / Entity View):** Public user or team profile view via unified handles registry. MUST ONLY display public lists and public metrics.
- **`/list/[id]` (List View):** Lists are public by default, EXCEPT when their visibility is set to `PRIVATE`. Private lists require the user to be authenticated AND be either the author or an authorized collaborator to access them.
- **`/dashboard`:** Primary authenticated user view. STRICTLY PROTECTED.
- **`/settings`:** User configuration and account management. STRICTLY PROTECTED.

## 9. Internationalization (i18n) & next-intl Guidelines
- **Modular Architecture:** Translation files must be decentralized and stored within the `locales/{locale}/` directory. Avoid monolithic translation files; split them by domain, page, or component.
- **Naming & Casing Conventions:**
  - **Namespaces:**
    - **UI Components:** Use **PascalCase** matching the exact React component name (e.g., `Item`, `NewListModal`).
    - **Pages / Routes:** Use **lowercase / camelCase** matching Next.js App Router paths (e.g., `dashboard`, `profile`).
    - **Global / Transverse Domains:** Use **lowercase** (e.g., `common`, `navigation`, `errors`, `date`).
  - **Translation Keys & Common Actions:**
    - Use **camelCase** for key properties.
    - Apply **semantic naming** based on the element's functional role (e.g., `cta.submit`, `hero.title`, `itemCount`).
    - **Basic Actions:** All standard, repetitive user actions (such as `edit`, `archive`, `moveTo`, `copyTo`, `addTo`, `delete`, etc.) **must** be stored in the `common` domain namespace using nested structured keys starting with `action` (e.g., `common.action.edit`, `common.action.delete`).
- **Implementation Best Practices:**
  - **Strict TypeScript Typing:** Configure global `IntlMessages` types so `useTranslations()` enforces autocompletion and compile-time key validation.
  - **Dynamic Interpolation:** Use native curly brace syntax for dynamic variables (e.g., `t('itemCount', { count })`).

## 10. Import Organization & Sorting Standards
All TypeScript/React source files must maintain a clean, standardized, and logically ordered import structure:
1. **Framework / Core Imports:** React and Next.js core modules (`react`, `next/navigation`, etc.).
2. **Third-Party Libraries:** External packages (`next-intl`, icons, external dependencies).
3. **Internal Path Aliases:** Absolute imports using project aliases (`@/components/...`, `@/lib/...`, `@/hooks/...`, `@/types/...`).
4. **Relative Imports:** Parent and local relative files (`../`, `./`).
5. **Styles:** CSS / SCSS Modules (e.g., `Button.module.scss`).
- **Formatting Rules:** Separate each category with a single blank line, alphabetize imports *within* each category, remove unused imports, and use explicit `import type` where applicable.

## 11. Code Maintenance, Cleanup & Refactoring Protocol
- **Periodic Cleanup on Demand:** The agent must be fully prepared to execute cleanup, dead-code elimination, and structural refactoring passes whenever explicitly requested by the user.
- **Proactive Proposals:** The agent is encouraged to proactively identify and suggest code cleanliness improvements (e.g., flagging unused imports, orphaned variables, deprecated helper functions, unused component files, or leftover code blocks from recent implementations) during development tasks.
- **Non-Compliance Detection & Correction:** If the agent notices that an existing file or component deviates from the guidelines and instructions defined in this `AGENTS.md` file, it must proactively notify the user, ask for confirmation to fix it, and refactor it in full compliance with these standards.
- **Compliance & Safety during Refactoring:**
  - All refactoring tasks must strictly uphold the structural, typing, styling (`.module.scss`), and internationalization rules outlined in this document.
  - Post-cleanup validation is mandatory: run type-checking (`tsc --noEmit`), linting (`eslint`), and formatting (`prettier`) to verify the repository remains completely healthy.
  - Use strict conventional commits (`refactor:`, `chore:`) for all cleanup and maintenance changes.

## 12. Code Quality & Security (Linting & Scanning)
Before submitting significant code changes, proactively verify code quality:
- **Type Checking:** Run `npx tsc --noEmit` to ensure there are no TypeScript errors.
- **Linting & Auto-fixing:** Run `npm run lint` or `npx eslint . --fix` to enforce coding standards.
- **Formatting:** Run `npx prettier --write .` for consistent code styling.
- **Dependency Security:** Run `npm audit` to check for vulnerable dependencies and suggest updates if necessary.
