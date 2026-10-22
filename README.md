# ReportFlow - Multi-Tenant Report and Project Management System (Front End)

Angular front end built from the Front-End SRS. Five roles (the Supervisor role was removed;
the **Branch Manager** now reviews reports):

Super Admin - Company Admin - Branch Manager - Employee - Intern

All data is **sample data** (src/app/core/mock-data.ts). When the back end is ready, replace the
functions in `mock-data.ts` / `auth.service.ts` with HTTP calls.

## Run it
1. Install Node.js LTS (https://nodejs.org) - check with `node -v`
2. Open this folder in VS Code, open a terminal (Ctrl + `)
3. `npm install`
4. `npm start`  -> http://localhost:4200

## Demo accounts (any password works)
| Role | Email |
|---|---|
| Super Admin | superadmin@demo.com |
| Company Admin | company@demo.com |
| Branch Manager | manager@demo.com |
| Employee | employee@demo.com |
| Intern | intern@demo.com |

You can also click a role under "Demo login as" on the login page.

## Where things are
- `core/` services, guards, navigation per role, sample data, list/form/dashboard configs
- `shared/` reusable components (data table, badges, toasts, confirm dialog, charts...)
- `layout/shell` sidebar + top bar
- `auth/` login, activate account (invitation), forgot / reset password
- `pages/` dashboard, generic list/form/detail pages, project + report details, notifications, profile, export

## Language switcher (EN / FR)
Use the **EN | FR** buttons in the top bar (and on the login card). The choice is remembered.
English text is the key; French translations live in `src/app/core/i18n-fr.ts`. In templates use
`{{ 'English text' | t }}`; in code use `I18nService.t('English text', { param })`. Missing keys simply stay in English.
Sample records (report descriptions, names) are not translated - they stand in for real user data.

## Weekly report edit rule
An employee/intern can edit **their own** report only during the Monday-Sunday week in which it was submitted
(`src/app/core/report-rules.ts`). After that week ends the Edit button disappears and the edit page is blocked.
Editing sends the report back to "Awaiting Review". The back end must enforce the same rule.
In the sample data, RPT-101 (employee) and RPT-102 (intern) were submitted on Monday 2026-10-19, so they are editable until Sunday 25 Oct 2026; older reports are locked.
