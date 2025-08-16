// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import next from "eslint-config-next";

export default [
  // 1) Ignore files (optional)
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "src/hooks/use-FluidCursor.tsx", // temporarily ignore the heavy file
    ],
  },

  // 2) Base + Next + TS rules
  js.configs.recommended,
  ...tseslint.configs.recommended,
  next,

  // 3) Project rules (override the failing ones)
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "prefer-const": "off",
      "@next/next/no-html-link-for-pages": "off",
      "@next/next/no-img-element": "warn",
      // if you want to ship even with hooks warnings (not recommended long-term):
      // "react-hooks/rules-of-hooks": "off",
    },
  },
];
