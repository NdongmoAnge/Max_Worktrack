import { BRANCHES, DEPARTMENTS } from './mock-data';
import { canEditReport } from './report-rules';

export interface Column { key: string; label: string; type?: 'text' | 'badge' | 'progress' | 'tags'; }
export interface FilterDef { key: string; label: string; options: string[]; }
export interface RowAction { key: string; label: string; icon: string; link?: string; danger?: boolean; when?: (row: any) => boolean; }
export interface ListConfig {
  title: string; crumbs: string[]; columns: Column[]; filters?: FilterDef[]; actions?: RowAction[];
  createLink?: string; createLabel?: string; searchPlaceholder: string; emptyMessage: string;
}

const view = (link: string, label = 'View'): RowAction => ({ key: 'view', label, icon: 'eye', link });
const edit = (link: string): RowAction => ({ key: 'edit', label: 'Edit', icon: 'edit', link });
const status = (options: string[]): FilterDef => ({ key: 'status', label: 'Status', options });
const branchNames = BRANCHES.map(b => b.name);
const deptNames = DEPARTMENTS.map(d => d.name);

const reportColumns: Column[] = [
  { key: 'id', label: 'Report' }, { key: 'employee', label: 'Employee' }, { key: 'projects', label: 'Projects', type: 'tags' },
  { key: 'activityStatus', label: 'Activity status', type: 'badge' },
  { key: 'reviewStatus', label: 'Review status', type: 'badge' },
  { key: 'submittedAt', label: 'Submitted' }
];
const reportFilters: FilterDef[] = [
  { key: 'reviewStatus', label: 'Review status', options: ['Awaiting Review', 'Approved', 'Rejected', 'Needs Correction'] },
  { key: 'activityStatus', label: 'Activity status', options: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'] }
];
const projectFilter = status(['Not Started', 'In Progress', 'Completed', 'Delayed', 'Paused']);

export const LIST_CONFIGS: Record<string, ListConfig> = {
  enterprises: {
    title: 'Enterprises', crumbs: ['Enterprises'], searchPlaceholder: 'Search by enterprise name...', emptyMessage: 'No enterprises found. Create your first enterprise to get started.',
    createLink: '{base}/enterprises/new', createLabel: 'Create Enterprise',
    columns: [{ key: 'name', label: 'Enterprise name' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'createdAt', label: 'Date created' }],
    filters: [status(['Active', 'Suspended'])],
    actions: [view('{base}/enterprises/{id}'), edit('{base}/enterprises/{id}/edit'),
      { key: 'suspend', label: 'Suspend', icon: 'pause', danger: true, when: r => r.status === 'Active' },
      { key: 'activate', label: 'Activate', icon: 'play', when: r => r.status === 'Suspended' }]
  },
  invitations: {
    title: 'Company Admin Invitations', crumbs: ['Invitations'], searchPlaceholder: 'Search invitations...', emptyMessage: 'No invitations found.',
    createLink: '{base}/invitations/new', createLabel: 'Send Invitation',
    columns: [{ key: 'enterprise', label: 'Enterprise' }, { key: 'invitee', label: 'Invitee' }, { key: 'email', label: 'Invitee email' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'invitedAt', label: 'Invitation date' }, { key: 'expiresAt', label: 'Expires' }],
    filters: [status(['Pending', 'Accepted', 'Expired', 'Revoked'])],
    actions: [
      { key: 'resend', label: 'Resend', icon: 'refresh', when: r => r.status === 'Pending' || r.status === 'Expired' },
      { key: 'revoke', label: 'Revoke', icon: 'x', danger: true, when: r => r.status === 'Pending' }]
  },
  'platform-users': {
    title: 'Platform Users', crumbs: ['Platform Users'], searchPlaceholder: 'Search users...', emptyMessage: 'No users found.',
    columns: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'enterprise', label: 'Enterprise' }, { key: 'status', label: 'Status', type: 'badge' }],
    filters: [{ key: 'role', label: 'Role', options: ['Super Admin', 'Company Admin', 'Branch Manager', 'Employee', 'Intern'] }, status(['Active', 'Inactive'])]
  },
  'activity-logs': {
    title: 'Activity Logs', crumbs: ['Activity Logs'], searchPlaceholder: 'Search activity...', emptyMessage: 'No activity recorded yet.',
    columns: [{ key: 'time', label: 'Date and time' }, { key: 'actor', label: 'Performed by' }, { key: 'action', label: 'Action' }, { key: 'target', label: 'Target' }]
  },
  users: {
    title: 'User Management', crumbs: ['Users'], searchPlaceholder: 'Search by name or email...', emptyMessage: 'No users found. Add your first user to get started.',
    createLink: '{base}/users/new', createLabel: 'Add User',
    columns: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'branch', label: 'Branch' }, { key: 'department', label: 'Department' }, { key: 'status', label: 'Account', type: 'badge' }, { key: 'invitation', label: 'Invitation', type: 'badge' }],
    filters: [{ key: 'role', label: 'Role', options: ['Branch Manager', 'Employee', 'Intern'] }, { key: 'branch', label: 'Branch', options: branchNames }, { key: 'department', label: 'Department', options: deptNames }, status(['Active', 'Inactive'])],
    actions: [view('{base}/users/{id}'), edit('{base}/users/{id}/edit'),
      { key: 'deactivate', label: 'Deactivate', icon: 'pause', danger: true, when: r => r.status === 'Active' },
      { key: 'activate', label: 'Activate', icon: 'play', when: r => r.status === 'Inactive' }]
  },
  branches: {
    title: 'Branch Management', crumbs: ['Branches'], searchPlaceholder: 'Search branches...', emptyMessage: 'No branches found. Create your first branch to get started.',
    createLink: '{base}/branches/new', createLabel: 'Create Branch',
    columns: [{ key: 'name', label: 'Branch' }, { key: 'city', label: 'City' }, { key: 'manager', label: 'Branch manager' }, { key: 'employees', label: 'People' }, { key: 'status', label: 'Status', type: 'badge' }],
    actions: [edit('{base}/branches/{id}/edit')]
  },
  departments: {
    title: 'Department Management', crumbs: ['Departments'], searchPlaceholder: 'Search departments...', emptyMessage: 'No departments found. Create your first department to get started.',
    createLink: '{base}/departments/new', createLabel: 'Create Department',
    columns: [{ key: 'name', label: 'Department' }, { key: 'branch', label: 'Branch' }, { key: 'head', label: 'Head' }, { key: 'members', label: 'Members' }],
    filters: [{ key: 'branch', label: 'Branch', options: branchNames }],
    actions: [edit('{base}/departments/{id}/edit')]
  },
  projects: {
    title: 'Project Management', crumbs: ['Projects'], searchPlaceholder: 'Search by project name or ID...', emptyMessage: 'No projects found. Create your first project to get started.',
    createLink: '{base}/projects/new', createLabel: 'Create Project',
    columns: [{ key: 'id', label: 'Project ID' }, { key: 'name', label: 'Project name' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'plannedFinish', label: 'Planned finish' }, { key: 'actualFinish', label: 'Actual finish' }],
    filters: [projectFilter],
    actions: [view('{base}/projects/{id}'), edit('{base}/projects/{id}/edit')]
  },
  'company-reports': {
    title: 'Activity Reports', crumbs: ['Activity Reports'], searchPlaceholder: 'Search reports...', emptyMessage: 'No reports found.',
    columns: reportColumns, filters: reportFilters, actions: [view('{base}/reports/{id}', 'Open')]
  },
  'branch-users': {
    title: 'Employees and Interns', crumbs: ['Employees & Interns'], searchPlaceholder: 'Search by name or email...', emptyMessage: 'No employees or interns found in this branch.',
    columns: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }, { key: 'role', label: 'Role' }, { key: 'department', label: 'Department' }, { key: 'weeklyReport', label: 'This week\'s report', type: 'badge' }],
    filters: [{ key: 'role', label: 'Role', options: ['Employee', 'Intern'] }, { key: 'weeklyReport', label: 'Weekly report', options: ['Submitted', 'Missing'] }]
  },
  'branch-projects': {
    title: 'Branch Projects', crumbs: ['Branch Projects'], searchPlaceholder: 'Search by project name or ID...', emptyMessage: 'No projects found for this branch.',
    columns: [{ key: 'id', label: 'Project ID' }, { key: 'name', label: 'Project name' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'plannedFinish', label: 'Planned finish' }, { key: 'actualFinish', label: 'Actual finish' }, { key: 'delay', label: 'Delay information' }],
    filters: [projectFilter], actions: [view('{base}/projects/{id}')]
  },
  'project-progress': {
    title: 'Project Progress', crumbs: ['Project Progress'], searchPlaceholder: 'Search projects...', emptyMessage: 'No projects found for this branch.',
    columns: [{ key: 'id', label: 'Project ID' }, { key: 'name', label: 'Project name' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'progress', label: 'Progress', type: 'progress' }, { key: 'delay', label: 'Delay information' }],
    filters: [projectFilter], actions: [view('{base}/projects/{id}')]
  },
  'branch-reports': {
    title: 'Weekly Activity Reports', crumbs: ['Weekly Activity Reports'], searchPlaceholder: 'Search reports...', emptyMessage: 'No reports found.',
    columns: reportColumns, filters: reportFilters, actions: [view('{base}/reports/{id}', 'Open')]
  },
  'review-queue': {
    title: 'Report Reviews', crumbs: ['Report Reviews'], searchPlaceholder: 'Search reports awaiting review...', emptyMessage: 'No reports are waiting for review.',
    columns: [{ key: 'id', label: 'Report' }, { key: 'employee', label: 'Employee' }, { key: 'projects', label: 'Projects', type: 'tags' }, { key: 'activityStatus', label: 'Activity status', type: 'badge' }, { key: 'submittedAt', label: 'Submitted' }],
    actions: [{ key: 'review', label: 'Review', icon: 'check-square', link: '{base}/reports/{id}' }]
  },
  'review-history': {
    title: 'Review History', crumbs: ['Review History'], searchPlaceholder: 'Search reviewed reports...', emptyMessage: 'No reports have been reviewed yet.',
    columns: [{ key: 'id', label: 'Report' }, { key: 'employee', label: 'Employee' }, { key: 'projects', label: 'Projects', type: 'tags' }, { key: 'reviewStatus', label: 'Review status', type: 'badge' }, { key: 'reviewedAt', label: 'Reviewed' }],
    filters: [{ key: 'reviewStatus', label: 'Review status', options: ['Approved', 'Rejected', 'Needs Correction'] }],
    actions: [view('{base}/reports/{id}', 'Open')]
  },
  'my-projects': {
    title: 'My Projects', crumbs: ['My Projects'], searchPlaceholder: 'Search by project name or ID...', emptyMessage: 'No projects have been assigned to you yet.',
    columns: [{ key: 'id', label: 'Project ID' }, { key: 'name', label: 'Project name' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'plannedFinish', label: 'Planned finish' }, { key: 'progress', label: 'Progress', type: 'progress' }],
    filters: [projectFilter], actions: [view('{base}/projects/{id}')]
  },
  'my-reports': {
    title: 'My Reports', crumbs: ['My Reports'], searchPlaceholder: 'Search my reports...', emptyMessage: 'You have not submitted any reports yet. Submit your first weekly report to get started.',
    createLink: '{base}/submit-report', createLabel: 'Submit Weekly Report',
    columns: [{ key: 'id', label: 'Report' }, { key: 'projects', label: 'Projects', type: 'tags' }, { key: 'activityStatus', label: 'Activity status', type: 'badge' }, { key: 'reviewStatus', label: 'Review status', type: 'badge' }, { key: 'submittedAt', label: 'Submitted' }],
    filters: [{ key: 'reviewStatus', label: 'Review status', options: ['Awaiting Review', 'Approved', 'Rejected', 'Needs Correction'] }],
    actions: [view('{base}/reports/{id}', 'Details'),
      { key: 'edit-report', label: 'Edit', icon: 'edit', link: '{base}/reports/{id}/edit', when: r => canEditReport(r) }]
  }
};
