import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn', // Allow 'any' but warn
      '@typescript-eslint/no-unused-vars': 'warn', // Allow unused vars but warn
      '@next/next/no-img-element': 'warn', // Allow img tags but warn
      'react/no-unescaped-entities': 'warn', // Allow unescaped entities but warn
      'react-hooks/exhaustive-deps': 'warn', // Allow missing deps but warn
      '@typescript-eslint/no-require-imports': 'warn', // Allow require but warn
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
