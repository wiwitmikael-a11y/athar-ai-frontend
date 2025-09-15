// Fix: The triple-slash directive `/// <reference types="vite/client" />` was causing a
// "Cannot find type definition file" error. This is likely due to a misconfiguration in
// the project's tsconfig. As a workaround, the directive is removed and we manually
// declare the type for `import.meta.env` to solve both TypeScript errors.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_BACKEND_URL?: string;
    };
  }
}

// This will be sourced from Vercel's environment variables at build time.
// For local development, you can create a .env.local file.
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://813eec65-23fd-4b03-bd66-cc44d76e753f-00-2bz3a8nxcmmcg.sisko.replit.dev:8080';
