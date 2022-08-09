/* eslint-disable */
module.exports = {
  root: true,
  env: {
    es6: true,
    browser: true,
  },
  extends: ["eslint:recommended", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
  plugins: ["simple-import-sort", "import", "prettier"],
  rules: {
    "padding-line-between-statements": [
      "error",

      {
        blankLine: "always",
        prev: "*",
        next: [
          "return",
          "export",
          "function",
          "class",
          "multiline-const",
          "multiline-block-like",
          "multiline-expression",
        ],
      },
    ],
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // Side effect imports.
          ["^\\u0000"],
          // Packages.
          ["^vue"],
          ["^@?ionic"],
          // Things that start with a letter (or digit or underscore), or `@` followed by a letter.
          ["^@?\\w"],
          // Absolute imports and other imports such as Vue-style `@/foo`.
          // Anything not matched in another group.
          ["^"],
          // Relative imports.
          // Anything that starts with a dot.
          ["^\\."],
        ],
      },
    ],
    "simple-import-sort/exports": "error",
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

    camelcase: 1,
    "no-use-before-define": "off",
    // 'prettier/prettier': 1,
  },
  overrides: [
    {
      files: [
        "**/__tests__/*.{j,t}s?(x)",
        "**/tests/unit/**/*.spec.{j,t}s?(x)",
      ],
      env: {
        jest: true,
      },
    },
  ],
};
