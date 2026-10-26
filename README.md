# Max WorkTrack - Multi-Tenant Report and Project Management System (Front End)

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

## Accounts (sample data)
| Role | Email | Password |
|---|---|---|
| Super Admin | superadmin@demo.com | Admin@2026 |
| Company Admin | company@demo.com | Company@2026 |
| Branch Manager | manager@demo.com | Manager@2026 |
| Employee | employee@demo.com | Employee@2026 |
| Intern | intern@demo.com | Intern@2026 |

These passwords exist only in the front-end sample data. The real back end will own authentication.

## Invitations (everyone joins by email invitation)
- **Super Admin** creates an enterprise / invites its Company Admin.
- **Company Admin** invites Branch Managers, Employees and Interns (Users > Invite User, or the Invitations page).
- The invitee opens the emailed link (`/accept-invitation?token=...`), chooses a password and can then log in.
- Real e-mail sending belongs to the back end. In this front end use **Copy link** in the invitations list and open the link to test the flow.
- Seeded pending invitations: Nadine Kouam (Intern) and Hervé Tchinda (Employee); use *Copy link* in Company Admin > Invitations.

## Welcome page carousel
The screenshots are embedded in `src/app/core/screens.ts` (originals in `brand/screens/`).

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

## Max WorkTrack updates
- **Logo:** `public/logo.png` (transparent, light backgrounds), `public/logo-dark.png` (for the dark sidebar), `public/logo-white.png` (login panel), `public/favicon.png`.
- **Menu:** the burger menu (the sidebar on desktop) holds the logo, navigation, the EN/FR switch, the profile picture + user name, and Logout. There is no top search bar or home icon any more.
- **Profile picture:** every user can add, change or remove it in Profile Settings (stored in the browser for now).
- **Report date:** both the **Company Admin** (everyone in the enterprise) and the **Branch Manager** (own branch) choose the report date in *Reporting Schedule*.
- **Weekly report:** start and end dates are set by the system and cannot be changed; the project of a submitted activity is locked; the employee/intern must enter the **actual end date** (not earlier than the start date, not in the future).

## Logo and startup
- The logos are **embedded** in `src/app/core/brand.ts`, so they show without any extra folder. The original artwork is in `brand/`.
  To change the logo: replace the PNG files in `brand/`, then run `node brand/embed-logos.mjs`.
- The app opens with a spinner splash, then the **welcome page** (`/welcome`). Signed-in users go straight to their dashboard.
- The top bar shows the workspace and a **Profile Settings** link (also available in the burger menu).

## Layout, language default and footer
- The **sidebar** (desktop) and the **top bar** (phones) are fixed; only the page content scrolls.
- The **Super Admin** chooses each enterprise's **Default language** when creating/editing it. Its users get that language on login until they choose their own (EN | FR switch or Profile Settings > Language > "Company default" to go back).
- The app always opens on the **welcome page** (after the spinner splash); "Sign in" leads to the login page. The welcome page ends with the site footer (`shared/site-footer.component.ts`).
