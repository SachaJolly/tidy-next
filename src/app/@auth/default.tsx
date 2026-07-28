// src/app/@auth/default.tsx

// This file serves as a fallback for the @auth parallel route slot.
// When a route is navigated to that doesn't have a matching intercepted route
// (e.g., navigating to /discover), Next.js will render this component
// in the `auth` slot of the root layout.

// By returning null, we ensure that nothing is rendered for this slot on normal pages.
export default function Default() {
  return null;
}
