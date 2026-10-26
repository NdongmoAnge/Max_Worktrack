import { Route, Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { ShellComponent } from './layout/shell.component';
import { LoginComponent } from './auth/login.component';
import { AcceptInvitationComponent } from './auth/accept-invitation.component';
import { ForgotPasswordComponent, ResetPasswordComponent } from './auth/password-pages.component';
import { DashboardComponent } from './pages/dashboard.component';
import { ListPageComponent } from './pages/list-page.component';
import { FormPageComponent } from './pages/form-page.component';
import { DetailPageComponent } from './pages/detail-page.component';
import { ProjectDetailsComponent } from './pages/project-details.component';
import { ReportDetailsComponent } from './pages/report-details.component';
import { NotificationsComponent } from './pages/notifications.component';
import { ProfileComponent } from './pages/profile.component';
import { ExportComponent } from './pages/export.component';
import { ScheduleComponent } from './pages/schedule.component';
import { WelcomeComponent } from './pages/welcome.component';

const list = (path: string, entity: string): Route => ({ path, component: ListPageComponent, data: { entity } });
const form = (path: string, entity: string, mode: 'create' | 'edit' = 'create'): Route => ({ path, component: FormPageComponent, data: { entity, mode } });
const detail = (path: string, entity: string): Route => ({ path, component: DetailPageComponent, data: { entity } });
const home: Route = { path: '', pathMatch: 'full', redirectTo: 'dashboard' };
const dash: Route = { path: 'dashboard', component: DashboardComponent };
const profile: Route = { path: 'profile', component: ProfileComponent };
const projectDetails: Route = { path: 'projects/:id', component: ProjectDetailsComponent };
const reportDetails: Route = { path: 'reports/:id', component: ReportDetailsComponent };

const superAdmin: Route[] = [
  home, dash,
  list('enterprises', 'enterprises'), form('enterprises/new', 'enterprise'),
  detail('enterprises/:id', 'enterprise'), form('enterprises/:id/edit', 'enterprise', 'edit'),
  list('invitations', 'invitations'), form('invitations/new', 'invitation'),
  list('platform-users', 'platform-users'), list('activity-logs', 'activity-logs'),
  profile
];

const companyAdmin: Route[] = [
  home, dash,
  list('users', 'users'), list('invitations', 'user-invitations'), form('users/new', 'user'), detail('users/:id', 'user'), form('users/:id/edit', 'user', 'edit'),
  list('branches', 'branches'), form('branches/new', 'branch'), form('branches/:id/edit', 'branch', 'edit'),
  { path: 'schedule', component: ScheduleComponent },
  list('departments', 'departments'), form('departments/new', 'department'), form('departments/:id/edit', 'department', 'edit'),
  list('projects', 'projects'), form('projects/new', 'project'), projectDetails, form('projects/:id/edit', 'project', 'edit'),
  list('reports', 'company-reports'), reportDetails,
  { path: 'export', component: ExportComponent },
  profile
];

const branchManager: Route[] = [
  home, dash,
  detail('branch', 'branch-info'),
  list('employees', 'branch-users'),
  { path: 'schedule', component: ScheduleComponent },
  list('projects', 'branch-projects'), projectDetails,
  list('progress', 'project-progress'),
  list('reports', 'branch-reports'), reportDetails,
  list('reviews', 'review-queue'),
  list('review-history', 'review-history'),
  profile
];

const worker: Route[] = [
  home, dash,
  list('projects', 'my-projects'), projectDetails,
  form('submit-report', 'report'),
  list('reports', 'my-reports'), form('reports/:id/edit', 'report', 'edit'), reportDetails,
  { path: 'notifications', component: NotificationsComponent },
  profile
];

export const routes: Routes = [
  { path: 'welcome', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'accept-invitation', component: AcceptInvitationComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  {
    path: '', component: ShellComponent, canActivate: [authGuard],
    children: [
      { path: 'super-admin', canActivate: [roleGuard('super_admin')], children: superAdmin },
      { path: 'company-admin', canActivate: [roleGuard('company_admin')], children: companyAdmin },
      { path: 'branch-manager', canActivate: [roleGuard('branch_manager')], children: branchManager },
      { path: 'employee', canActivate: [roleGuard('employee')], children: worker },
      { path: 'intern', canActivate: [roleGuard('intern')], children: worker }
    ]
  },
  { path: '**', redirectTo: 'welcome' }
];
