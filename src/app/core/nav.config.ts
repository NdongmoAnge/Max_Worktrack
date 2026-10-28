import { Role } from './models';

export interface NavItem { label: string; icon: string; path: string; }

const worker: NavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
  { label: 'My Projects', icon: 'folder', path: 'projects' },
  { label: 'Submit Weekly Report', icon: 'send', path: 'submit-report' },
  { label: 'My Reports', icon: 'file', path: 'reports' },
  { label: 'Notifications', icon: 'bell', path: 'notifications' },
  { label: 'Profile Settings', icon: 'user', path: 'profile' }
];

export const NAV: Record<Role, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Enterprises', icon: 'building', path: 'enterprises' },
    { label: 'Company Admin Invitations', icon: 'mail', path: 'invitations' },
    { label: 'Platform Users', icon: 'users', path: 'platform-users' },
    { label: 'Activity Logs', icon: 'activity', path: 'activity-logs' },
    { label: 'Profile Settings', icon: 'user', path: 'profile' }
  ],
  company_admin: [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Users', icon: 'users', path: 'users' },
    { label: 'Invitations', icon: 'mail', path: 'invitations' },
    { label: 'Branches', icon: 'branch', path: 'branches' },
    { label: 'Departments', icon: 'layers', path: 'departments' },
    { label: 'Reporting Schedule', icon: 'calendar', path: 'schedule' },
    { label: 'Projects', icon: 'folder', path: 'projects' },
    { label: 'Activity Reports', icon: 'file', path: 'reports' },
    { label: 'Reports & Statistics', icon: 'chart', path: 'export' },
    { label: 'Company Profile', icon: 'building', path: 'company' },
    { label: 'Profile Settings', icon: 'user', path: 'profile' }
  ],
  branch_manager: [
    { label: 'Dashboard', icon: 'dashboard', path: 'dashboard' },
    { label: 'Branch Information', icon: 'info', path: 'branch' },
    { label: 'Employees & Interns', icon: 'users', path: 'employees' },
    { label: 'Invitations', icon: 'mail', path: 'invitations' },
    { label: 'Reporting Schedule', icon: 'calendar', path: 'schedule' },
    { label: 'Branch Projects', icon: 'folder', path: 'projects' },
    { label: 'Project Progress', icon: 'chart', path: 'progress' },
    { label: 'Weekly Activity Reports', icon: 'file', path: 'reports' },
    { label: 'Report Reviews', icon: 'check-square', path: 'reviews' },
    { label: 'Review History', icon: 'clock', path: 'review-history' },
    { label: 'Profile Settings', icon: 'user', path: 'profile' }
  ],
  employee: worker,
  intern: worker
};
