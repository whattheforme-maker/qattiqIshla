import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  // Keep the starter on the flat config export that actually runs under the pinned ESLint/Next toolchain.
  ...nextCoreWebVitals,
  {
    rules: {
      // O'zbekcha matnlarda ' belgisi ataylab ishlatiladi (O'zbekiston, o'rganing...).
      // Bu runtime xato emas — faqat stilistik qoida, shuning uchun o'chiramiz.
      "react/no-unescaped-entities": "off",
      // Sahifalar localStorage dan client-side yuklaydi — effect ichida setState majburiy.
      // Next 16 dagi yangi qoidalar buni error qiladi, warn ga tushiramiz.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/exhaustive-deps": "warn",
      // App Router layout.tsx da <link> orqali font ulash rasmiy usul.
      "@next/next/no-page-custom-font": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);
