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
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React specific rules
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",

      // ES7+ and modern JavaScript features
      "prefer-const": "warn",
      "no-var": "error",
      "prefer-arrow-callback": "off",
      "prefer-template": "off",
      "object-shorthand": "off",
      "prefer-destructuring": "off",

      // Code quality
      "no-console": "off",
      "no-debugger": "warn",
      "no-duplicate-imports": "warn",
      "no-unused-expressions": "off",

      // Next.js specific
      "@next/next/no-img-element": "error",
      "@next/next/no-page-custom-font": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "*.tsbuildinfo",
      "generated/**",
      "prisma/generated/**",
      "coverage/**",
      ".vscode/**",
      ".idea/**",
    ],
  },
];

export default eslintConfig;
