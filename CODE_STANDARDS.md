# Code Standards & Rules Summary

## Overview
This document outlines the code standards, formatting rules, and development practices established for consistent code quality across all repositories.

## Code Formatting & Quality Rules

### ESLint Configuration (.eslintrc.json)
```json
{
  "env": {
    "es2021": true,
    "node": true
  },
  "extends": ["eslint:recommended"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "camelcase": [
      "error",
      {
        "properties": "never",
        "ignoreDestructuring": true,
        "ignoreImports": true,
        "allow": ["^[a-z]+(_[a-z]+)*$"]
      }
    ],
    "no-unused-vars": "warn",
    "no-console": "off",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier Configuration (.prettierrc)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### EditorConfig (.editorconfig)
```
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

## Git Hooks & Pre-commit Rules

### Husky Pre-commit Hook (.husky/pre-commit)
```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint
npm run format:check
```

### Lint-staged Configuration (package.json)
```json
"lint-staged": {
  "src/**/*.js": [
    "eslint --fix",
    "prettier --write"
  ]
}
```

## Package.json Scripts
```json
"scripts": {
  "lint": "eslint src/**/*.js",
  "lint:fix": "eslint src/**/*.js --fix",
  "format": "prettier --write src/**/*.js",
  "format:check": "prettier --check src/**/*.js",
  "prepare": "husky install"
}
```

## Required Dev Dependencies
```json
"devDependencies": {
  "eslint": "^8.57.0",
  "husky": "^8.0.3",
  "lint-staged": "^15.0.0",
  "prettier": "^3.0.0"
}
```

## Naming Conventions

### Variables & Functions
- **MUST** use camelCase: `userName`, `getUserData()`
- **FORBIDDEN**: snake_case for variables/functions

### Database Properties
- **ALLOWED** snake_case: `user_type`, `created_at`, `password_hash`
- **ALLOWED** in destructuring: `const { user_type } = user;`

### Constants
- **PREFERRED** UPPER_SNAKE_CASE: `API_KEY`, `JWT_SECRET`

## Code Quality Rules

### Enforced Rules
1. **No unused variables** (warning)
2. **Prefer const over let** (error)
3. **No var declarations** (error)
4. **Console.log allowed** (for debugging)
5. **Semicolons required** (Prettier)
6. **Double quotes preferred** (Prettier)
7. **2-space indentation** (Prettier)

### Pre-commit Enforcement
- **Linting must pass** - no errors allowed
- **Code must be formatted** - Prettier check required
- **Commit blocked** if rules violated
- **Auto-fix available** via `npm run lint:fix` and `npm run format`

## Setup Instructions for New Repos

1. **Copy configuration files:**
   - `.eslintrc.json`
   - `.prettierrc`
   - `.editorconfig`
   - `.husky/` directory

2. **Install dependencies:**
   ```bash
   npm install eslint husky lint-staged prettier --save-dev
   ```

3. **Add scripts to package.json:**
   ```json
   "scripts": {
     "lint": "eslint src/**/*.js",
     "lint:fix": "eslint src/**/*.js --fix",
     "format": "prettier --write src/**/*.js",
     "format:check": "prettier --check src/**/*.js",
     "prepare": "husky install"
   },
   "lint-staged": {
     "src/**/*.js": [
       "eslint --fix",
       "prettier --write"
     ]
   }
   ```

4. **Initialize husky:**
   ```bash
   npm run prepare
   ```

5. **Make pre-commit hook executable:**
   ```bash
   chmod +x .husky/pre-commit
   ```

## Benefits
- ✅ Consistent code style across all repositories
- ✅ Automatic code formatting
- ✅ Pre-commit quality checks
- ✅ Prevents bad code from being committed
- ✅ Team collaboration without style conflicts
- ✅ Professional code quality standards

## Commands for Developers
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format all code files
npm run format:check  # Check if code is properly formatted
```

## Troubleshooting
- **Commit blocked?** Run `npm run lint:fix` and `npm run format`
- **Formatting issues?** Run `npm run format` before committing
- **Linting errors?** Check console output and fix manually or use `npm run lint:fix`