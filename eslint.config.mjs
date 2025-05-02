import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint-define-config";
import stylistic from "@stylistic/eslint-plugin";
import nextjs from '@next/eslint-plugin-next';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a compat instance that mimics the old config format
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: {}, // Add empty recommendedConfig
});

export default defineConfig({
  plugins: {
    stylistic,
    '@next/next': nextjs,
  },
  extends: [
    ...compat.extends("next/core-web-vitals"),
  ],
  rules: {
    "stylistic/semi": "error",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-html-link-for-pages": "error",
  },
});
