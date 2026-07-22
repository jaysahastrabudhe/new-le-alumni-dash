# Let's Enterprise Alumni Network

## Admin setup

Admin access is enforced by the API through the `adminProcedure` guard. A user must have `role = 'admin'` in the database; changing browser storage cannot grant API access.

Create a new admin or promote an existing member with the one-time bootstrap command:

```powershell
$env:ADMIN_EMAIL='admin@example.com'
$env:ADMIN_NAME='LE Administrator'
$env:ADMIN_PASSWORD='use-a-strong-password'
npm run admin:create
```

If the email already exists, the account is promoted and verified. If it does not exist, a new hidden admin profile is created. Remove the temporary shell variables after running the command.

The admin member screen supports CSV imports with these columns:

```text
name,email,role,batchYear,company,location,headline,visibility,isVerified,temporaryPassword
```

Only `name` and `email` are required. Imports are limited to 100 rows. Missing passwords are generated and displayed once after creation.

## Password management

- Members can change their password from **My Profile**. This revokes every existing session.
- Admins can issue a generated or custom temporary password from **Admin → Members**. This also revokes existing sessions.
- Email-based reset links are not enabled because the project does not currently have an email delivery provider.

## Development

```bash
npm install
npm run db:push
npm run dev
```

The frontend runs on `http://localhost:5173` and the API on `http://localhost:3001`.

## Original Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
