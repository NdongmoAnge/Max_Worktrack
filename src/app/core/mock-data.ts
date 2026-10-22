import { User } from './models';
import { summarizeEntries } from './report-rules';

/* ------------------------------------------------------------------ */
/*  SAMPLE DATA - replace with real API calls when the back end is ready */
/* ------------------------------------------------------------------ */

export const DEMO_USERS: User[] = [
  { id: 1, firstName: 'Platform', lastName: 'Admin', email: 'superadmin@demo.com', role: 'super_admin', enterprise: 'ReportFlow Platform' },
  { id: 2, firstName: 'Linda', lastName: 'Essomba', email: 'company@demo.com', role: 'company_admin', enterprise: 'Maxwell Technology' },
  { id: 3, firstName: 'Samuel', lastName: 'Nkeng', email: 'manager@demo.com', role: 'branch_manager', enterprise: 'Maxwell Technology', branch: 'Douala HQ' },
  { id: 4, firstName: 'Carine', lastName: 'Fotso', email: 'employee@demo.com', role: 'employee', enterprise: 'Maxwell Technology', branch: 'Douala HQ' },
  { id: 5, firstName: 'Brice', lastName: 'Tamo', email: 'intern@demo.com', role: 'intern', enterprise: 'Maxwell Technology', branch: 'Douala HQ' }
];

export const ENTERPRISES: any[] = [
  { id: 1, name: 'Maxwell Technology', email: 'contact@maxwell.tech', phone: '+237 677 00 11 22', address: 'Bonanjo, Douala', status: 'Active', createdAt: '2026-09-02', adminName: 'Linda Essomba' },
  { id: 2, name: 'ABC Technologies', email: 'info@abctech.cm', phone: '+237 699 12 34 56', address: 'Bastos, Yaoundé', status: 'Suspended', createdAt: '2026-09-14', adminName: 'Roger Biyik' },
  { id: 3, name: 'Douala Logistics', email: 'hello@doualalogistics.cm', phone: '+237 677 45 67 89', address: 'Akwa, Douala', status: 'Active', createdAt: '2026-09-28', adminName: 'Sandra Mbia' },
  { id: 4, name: 'Kribi Energy', email: 'admin@kribi-energy.cm', phone: '+237 655 22 33 44', address: 'Port Road, Kribi', status: 'Active', createdAt: '2026-10-05', adminName: 'Paul Etoga' },
  { id: 5, name: 'Bamenda AgroTech', email: 'contact@bamendaagro.cm', phone: '+237 670 98 76 54', address: 'Commercial Avenue, Bamenda', status: 'Active', createdAt: '2026-10-12', adminName: 'Grace Tabi' },
  { id: 6, name: 'Yaoundé Health Systems', email: 'office@yhs.cm', phone: '+237 690 11 22 33', address: 'Mvog-Ada, Yaoundé', status: 'Active', createdAt: '2026-10-18', adminName: 'Idriss Mohamadou' }
];

export const INVITATIONS: any[] = [
  { id: 1, enterprise: 'Yaoundé Health Systems', invitee: 'Idriss Mohamadou', email: 'idriss@yhs.cm', status: 'Pending', invitedAt: '2026-10-18', expiresAt: '2026-10-25' },
  { id: 2, enterprise: 'Bamenda AgroTech', invitee: 'Grace Tabi', email: 'grace@bamendaagro.cm', status: 'Accepted', invitedAt: '2026-10-12', expiresAt: '2026-10-19' },
  { id: 3, enterprise: 'Kribi Energy', invitee: 'Paul Etoga', email: 'admin@kribi-energy.cm', status: 'Accepted', invitedAt: '2026-10-05', expiresAt: '2026-10-12' },
  { id: 4, enterprise: 'Douala Logistics', invitee: 'Sandra Mbia', email: 'sandra@doualalogistics.cm', status: 'Expired', invitedAt: '2026-09-28', expiresAt: '2026-10-05' },
  { id: 5, enterprise: 'ABC Technologies', invitee: 'Roger Biyik', email: 'roger@abctech.cm', status: 'Revoked', invitedAt: '2026-09-14', expiresAt: '2026-09-21' }
];

export const PLATFORM_USERS: any[] = [
  { id: 1, name: 'Platform Admin', email: 'superadmin@demo.com', role: 'Super Admin', enterprise: 'ReportFlow Platform', status: 'Active' },
  { id: 2, name: 'Linda Essomba', email: 'company@demo.com', role: 'Company Admin', enterprise: 'Maxwell Technology', status: 'Active' },
  { id: 3, name: 'Roger Biyik', email: 'roger@abctech.cm', role: 'Company Admin', enterprise: 'ABC Technologies', status: 'Inactive' },
  { id: 4, name: 'Paul Etoga', email: 'admin@kribi-energy.cm', role: 'Company Admin', enterprise: 'Kribi Energy', status: 'Active' },
  { id: 5, name: 'Grace Tabi', email: 'grace@bamendaagro.cm', role: 'Company Admin', enterprise: 'Bamenda AgroTech', status: 'Active' },
  { id: 6, name: 'Samuel Nkeng', email: 'manager@demo.com', role: 'Branch Manager', enterprise: 'Maxwell Technology', status: 'Active' },
  { id: 7, name: 'Carine Fotso', email: 'employee@demo.com', role: 'Employee', enterprise: 'Maxwell Technology', status: 'Active' },
  { id: 8, name: 'Brice Tamo', email: 'intern@demo.com', role: 'Intern', enterprise: 'Maxwell Technology', status: 'Active' }
];

export const LOGS: any[] = [
  { id: 1, time: '2026-10-20 16:42', actor: 'Platform Admin', action: 'Created enterprise', target: 'Yaoundé Health Systems' },
  { id: 2, time: '2026-10-18 09:15', actor: 'Platform Admin', action: 'Sent invitation', target: 'idriss@yhs.cm' },
  { id: 3, time: '2026-10-14 11:03', actor: 'Grace Tabi', action: 'Accepted invitation', target: 'Bamenda AgroTech' },
  { id: 4, time: '2026-10-12 08:30', actor: 'Platform Admin', action: 'Created enterprise', target: 'Bamenda AgroTech' },
  { id: 5, time: '2026-10-06 14:20', actor: 'Paul Etoga', action: 'Accepted invitation', target: 'Kribi Energy' },
  { id: 6, time: '2026-10-05 10:05', actor: 'Platform Admin', action: 'Resent invitation', target: 'sandra@doualalogistics.cm' },
  { id: 7, time: '2026-09-30 17:45', actor: 'Platform Admin', action: 'Suspended enterprise', target: 'ABC Technologies' },
  { id: 8, time: '2026-09-28 09:00', actor: 'Platform Admin', action: 'Created enterprise', target: 'Douala Logistics' }
];

const rawUsers: string[][] = [
  ['Samuel', 'Nkeng', 'Branch Manager', 'Douala HQ', 'Software Development', 'Active', 'Accepted'],
  ['Aline', 'Mouafo', 'Branch Manager', 'Yaoundé Branch', 'Network & Infrastructure', 'Active', 'Accepted'],
  ['Carine', 'Fotso', 'Employee', 'Douala HQ', 'Software Development', 'Active', 'Accepted'],
  ['Eric', 'Mbarga', 'Employee', 'Douala HQ', 'Software Development', 'Active', 'Accepted'],
  ['Joëlle', 'Nana', 'Employee', 'Douala HQ', 'Support', 'Active', 'Accepted'],
  ['Brice', 'Tamo', 'Intern', 'Douala HQ', 'Software Development', 'Active', 'Accepted'],
  ['Patrick', 'Ewane', 'Employee', 'Yaoundé Branch', 'Finance', 'Inactive', 'Accepted'],
  ['Nadine', 'Kouam', 'Intern', 'Yaoundé Branch', 'Support', 'Active', 'Pending'],
  ['Hervé', 'Tchinda', 'Employee', 'Bafoussam Branch', 'Support', 'Active', 'Pending'],
  ['Mireille', 'Atangana', 'Branch Manager', 'Bafoussam Branch', 'Finance', 'Active', 'Accepted']
];
const missing = ['Eric Mbarga', 'Joëlle Nana'];
const ascii = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ /g, '');

export const USERS: any[] = rawUsers.map((u, i) => ({
  id: i + 1, firstName: u[0], lastName: u[1], name: u[0] + ' ' + u[1],
  email: ascii(u[0] + '.' + u[1]) + '@maxwell.tech',
  role: u[2], branch: u[3], department: u[4], status: u[5], invitation: u[6],
  weeklyReport: missing.includes(u[0] + ' ' + u[1]) ? 'Missing' : 'Submitted'
}));

export const BRANCHES: any[] = [
  { id: 1, name: 'Douala HQ', city: 'Douala', manager: 'Samuel Nkeng', employees: 12, status: 'Active' },
  { id: 2, name: 'Yaoundé Branch', city: 'Yaoundé', manager: 'Aline Mouafo', employees: 8, status: 'Active' },
  { id: 3, name: 'Bafoussam Branch', city: 'Bafoussam', manager: 'Mireille Atangana', employees: 5, status: 'Active' }
];

export const DEPARTMENTS: any[] = [
  { id: 1, name: 'Software Development', branch: 'Douala HQ', head: 'Samuel Nkeng', members: 6 },
  { id: 2, name: 'Network & Infrastructure', branch: 'Yaoundé Branch', head: 'Aline Mouafo', members: 4 },
  { id: 3, name: 'Finance', branch: 'Bafoussam Branch', head: 'Mireille Atangana', members: 3 },
  { id: 4, name: 'Support', branch: 'Douala HQ', head: 'Joëlle Nana', members: 5 }
];

export const PROJECTS: any[] = [
  { id: 'PRJ-001', name: 'Website Redesign', description: 'Redesign of the corporate website with a new content structure and a responsive layout.', status: 'In Progress', plannedStart: '2026-08-03', plannedFinish: '2026-11-27', actualStart: '2026-08-05', actualFinish: '—', delay: 'On schedule', progress: 62, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Carine Fotso', 'Brice Tamo', 'Eric Mbarga'] },
  { id: 'PRJ-002', name: 'Inventory System', description: 'Stock tracking tool for the warehouse team, including low-stock alerts.', status: 'Completed', plannedStart: '2026-05-04', plannedFinish: '2026-09-30', actualStart: '2026-05-04', actualFinish: '2026-09-28', delay: 'Finished 2 days early', progress: 100, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Eric Mbarga', 'Joëlle Nana'] },
  { id: 'PRJ-003', name: 'Mobile Application', description: 'Customer-facing mobile application for order follow-up.', status: 'Paused', plannedStart: '2026-07-06', plannedFinish: '2026-12-18', actualStart: '2026-07-13', actualFinish: '—', delay: 'Project is on hold', progress: 35, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Carine Fotso', 'Joëlle Nana'] },
  { id: 'PRJ-004', name: 'Network Upgrade', description: 'Replacement of switches and cabling across the Douala offices.', status: 'Delayed', plannedStart: '2026-07-20', plannedFinish: '2026-10-09', actualStart: '2026-07-27', actualFinish: '—', delay: '12 days behind schedule', progress: 48, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Brice Tamo', 'Eric Mbarga'] },
  { id: 'PRJ-005', name: 'Customer Portal', description: 'Self-service portal where customers can follow tickets and invoices.', status: 'In Progress', plannedStart: '2026-09-07', plannedFinish: '2027-01-29', actualStart: '2026-09-10', actualFinish: '—', delay: 'On schedule', progress: 20, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Carine Fotso', 'Joëlle Nana'] },
  { id: 'PRJ-006', name: 'Payroll Automation', description: 'Automation of monthly payroll calculations.', status: 'Not Started', plannedStart: '2026-11-02', plannedFinish: '2027-03-12', actualStart: '—', actualFinish: '—', delay: 'Not started yet', progress: 0, manager: 'Samuel Nkeng', branch: 'Douala HQ', team: ['Eric Mbarga'] }
];

export const REPORTS: any[] = [
  { id: 'RPT-101', employee: 'Carine Fotso', project: 'Website Redesign', projectId: 'PRJ-001', description: 'Implemented the responsive homepage layout and fixed navigation issues on tablet screens.', startDate: '2026-10-12', endDate: '2026-10-16', activityStatus: 'In Progress', reviewStatus: 'Awaiting Review', submittedAt: '2026-10-19', comments: [] },
  { id: 'RPT-102', employee: 'Brice Tamo', project: 'Network Upgrade', projectId: 'PRJ-004', description: 'Mapped the existing switches and documented the cable routes for the second floor.', startDate: '2026-10-12', endDate: '2026-10-16', activityStatus: 'In Progress', reviewStatus: 'Awaiting Review', submittedAt: '2026-10-19', comments: [] },
  { id: 'RPT-103', employee: 'Eric Mbarga', project: 'Website Redesign', projectId: 'PRJ-001', description: 'Wrote the integration notes for the contact form and tested the validation rules.', startDate: '2026-10-05', endDate: '2026-10-09', activityStatus: 'Completed', reviewStatus: 'Approved', submittedAt: '2026-10-12', reviewedAt: '2026-10-13', comments: [{ by: 'Samuel Nkeng', text: 'Good work, approved.', at: '2026-10-13', decision: 'Approved' }] },
  { id: 'RPT-104', employee: 'Joëlle Nana', project: 'Customer Portal', projectId: 'PRJ-005', description: 'Prepared wireframes for the invoices page.', startDate: '2026-10-05', endDate: '2026-10-09', activityStatus: 'In Progress', reviewStatus: 'Needs Correction', submittedAt: '2026-10-12', reviewedAt: '2026-10-13', comments: [{ by: 'Samuel Nkeng', text: 'Please add the exact dates for each activity.', at: '2026-10-13', decision: 'Needs Correction' }] },
  { id: 'RPT-105', employee: 'Carine Fotso', project: 'Mobile Application', projectId: 'PRJ-003', description: 'Tested the login flow and documented three usability issues.', startDate: '2026-10-05', endDate: '2026-10-09', activityStatus: 'On Hold', reviewStatus: 'Approved', submittedAt: '2026-10-12', reviewedAt: '2026-10-14', comments: [{ by: 'Samuel Nkeng', text: 'Thanks for the clear notes.', at: '2026-10-14', decision: 'Approved' }] },
  { id: 'RPT-106', employee: 'Brice Tamo', project: 'Website Redesign', projectId: 'PRJ-001', description: 'Shadowed the team during the design review and updated the style guide.', startDate: '2026-10-05', endDate: '2026-10-09', activityStatus: 'Completed', reviewStatus: 'Approved', submittedAt: '2026-10-12', reviewedAt: '2026-10-14', comments: [{ by: 'Samuel Nkeng', text: 'Well done. Keep asking questions.', at: '2026-10-14', decision: 'Approved' }] },
  { id: 'RPT-107', employee: 'Eric Mbarga', project: 'Network Upgrade', projectId: 'PRJ-004', description: 'Configured VLANs for the finance office.', startDate: '2026-09-28', endDate: '2026-10-02', activityStatus: 'In Progress', reviewStatus: 'Rejected', submittedAt: '2026-10-05', reviewedAt: '2026-10-06', comments: [{ by: 'Samuel Nkeng', text: 'This work is not part of the assigned scope. Please resubmit with the right project.', at: '2026-10-06', decision: 'Rejected' }] },
  { id: 'RPT-108', employee: 'Carine Fotso', project: 'Customer Portal', projectId: 'PRJ-005', description: 'Designed the dashboard cards for the customer portal.', startDate: '2026-09-28', endDate: '2026-10-02', activityStatus: 'Completed', reviewStatus: 'Approved', submittedAt: '2026-10-05', reviewedAt: '2026-10-06', comments: [{ by: 'Samuel Nkeng', text: 'Approved.', at: '2026-10-06', decision: 'Approved' }] },
  { id: 'RPT-109', employee: 'Brice Tamo', project: 'Network Upgrade', projectId: 'PRJ-004', description: 'Labelled the patch panels and updated the equipment inventory.', startDate: '2026-09-28', endDate: '2026-10-02', activityStatus: 'Completed', reviewStatus: 'Approved', submittedAt: '2026-10-05', reviewedAt: '2026-10-06', comments: [{ by: 'Samuel Nkeng', text: 'Neat work.', at: '2026-10-06', decision: 'Approved' }] },
  { id: 'RPT-110', employee: 'Joëlle Nana', project: 'Inventory System', projectId: 'PRJ-002', description: 'Final acceptance testing with the warehouse team.', startDate: '2026-09-21', endDate: '2026-09-25', activityStatus: 'Completed', reviewStatus: 'Approved', submittedAt: '2026-09-28', reviewedAt: '2026-09-29', comments: [{ by: 'Samuel Nkeng', text: 'Approved. Great finish.', at: '2026-09-29', decision: 'Approved' }] }
];

// Each report holds one activity per project. A person can work on several projects in the same week.
REPORTS.forEach(r => {
  r.entries = [{ project: r.project, projectId: r.projectId, description: r.description, startDate: r.startDate, endDate: r.endDate, activityStatus: r.activityStatus }];
});
const extra = (id: string, e: any) => REPORTS.find(r => r.id === id)!.entries.push(e);
extra('RPT-101', { project: 'Customer Portal', projectId: 'PRJ-005', description: 'Reviewed the invoice page wireframes with the design lead and listed the changes.', startDate: '2026-10-14', endDate: '2026-10-16', activityStatus: 'Completed' });
extra('RPT-101', { project: 'Mobile Application', projectId: 'PRJ-003', description: 'Documented the open usability issues while the project is paused.', startDate: '2026-10-12', endDate: '2026-10-13', activityStatus: 'On Hold' });
extra('RPT-102', { project: 'Website Redesign', projectId: 'PRJ-001', description: 'Updated the style guide with the new colour tokens.', startDate: '2026-10-15', endDate: '2026-10-16', activityStatus: 'Completed' });
extra('RPT-105', { project: 'Customer Portal', projectId: 'PRJ-005', description: 'Built the dashboard card components.', startDate: '2026-10-07', endDate: '2026-10-09', activityStatus: 'In Progress' });
REPORTS.forEach(r => Object.assign(r, summarizeEntries(r.entries)));

export const NOTIFICATIONS: any[] = [
  { id: 1, type: 'info', message: 'Weekly reports are due on Monday. Remember to submit yours.', time: 'Today', read: false },
  { id: 2, type: 'success', message: 'Your report RPT-108 was approved by Samuel Nkeng.', time: '2 days ago', read: false },
  { id: 3, type: 'warning', message: 'Samuel Nkeng requested a correction on one of your reports.', time: '4 days ago', read: false },
  { id: 4, type: 'info', message: 'You were added to the project "Customer Portal".', time: '1 week ago', read: true }
];

const fullName = (u: User) => u.firstName + ' ' + u.lastName;
const copy = (a: any[]) => a.map(r => ({ ...r }));

/** Rows for each list page. */
export function dataFor(entity: string, user: User): any[] {
  const name = fullName(user);
  switch (entity) {
    case 'enterprises': return copy(ENTERPRISES);
    case 'invitations': return copy(INVITATIONS);
    case 'platform-users': return copy(PLATFORM_USERS);
    case 'activity-logs': return copy(LOGS);
    case 'users': return copy(USERS);
    case 'branches': return copy(BRANCHES);
    case 'departments': return copy(DEPARTMENTS);
    case 'projects': return copy(PROJECTS);
    case 'company-reports': return copy(REPORTS);
    case 'branch-users': return copy(USERS.filter(u => u.branch === user.branch && (u.role === 'Employee' || u.role === 'Intern')));
    case 'branch-projects':
    case 'project-progress': return copy(PROJECTS.filter(p => p.branch === user.branch));
    case 'branch-reports': return copy(REPORTS);
    case 'review-queue': return copy(REPORTS.filter(r => r.reviewStatus === 'Awaiting Review'));
    case 'review-history': return copy(REPORTS.filter(r => r.reviewStatus !== 'Awaiting Review'));
    case 'my-projects': return copy(PROJECTS.filter(p => p.team.includes(name)));
    case 'my-reports': return copy(REPORTS.filter(r => r.employee === name));
  }
  return [];
}

/** One record, used to pre-fill edit forms. */
export function lookup(entity: string, id: string | null): any | null {
  const find = (a: any[]) => a.find(x => String(x.id) === id) ?? null;
  switch (entity) {
    case 'enterprise': return find(ENTERPRISES);
    case 'user': return find(USERS);
    case 'branch': return find(BRANCHES);
    case 'department': return find(DEPARTMENTS);
    case 'project': return find(PROJECTS);
    case 'report': return find(REPORTS);
  }
  return null;
}

export interface DetailData {
  title: string; crumbs: string[]; editLink?: string; backLink: string;
  fields: { label: string; value: any; badge?: boolean }[];
}

export function detailFor(entity: string, id: string | null, user: User): DetailData | null {
  if (entity === 'enterprise') {
    const e = lookup('enterprise', id); if (!e) return null;
    return { title: e.name, crumbs: ['Enterprises', e.name], backLink: '{base}/enterprises', editLink: '{base}/enterprises/' + e.id + '/edit',
      fields: [
        { label: 'Enterprise name', value: e.name }, { label: 'Email', value: e.email }, { label: 'Phone', value: e.phone },
        { label: 'Address', value: e.address }, { label: 'Status', value: e.status, badge: true },
        { label: 'Date created', value: e.createdAt }, { label: 'Company admin', value: e.adminName }
      ] };
  }
  if (entity === 'user') {
    const u = lookup('user', id); if (!u) return null;
    return { title: u.name, crumbs: ['Users', u.name], backLink: '{base}/users', editLink: '{base}/users/' + u.id + '/edit',
      fields: [
        { label: 'First name', value: u.firstName }, { label: 'Last name', value: u.lastName }, { label: 'Email', value: u.email },
        { label: 'Role', value: u.role }, { label: 'Branch', value: u.branch }, { label: 'Department', value: u.department },
        { label: 'Account status', value: u.status, badge: true }, { label: 'Invitation status', value: u.invitation, badge: true }
      ] };
  }
  if (entity === 'branch-info') {
    const b = BRANCHES.find(x => x.name === user.branch) ?? BRANCHES[0];
    const people = USERS.filter(u => u.branch === b.name);
    return { title: b.name, crumbs: ['Branch Information'], backLink: '{base}/dashboard',
      fields: [
        { label: 'Branch', value: b.name }, { label: 'City', value: b.city }, { label: 'Branch manager', value: b.manager },
        { label: 'Employees', value: people.filter(u => u.role === 'Employee').length },
        { label: 'Interns', value: people.filter(u => u.role === 'Intern').length },
        { label: 'Active projects', value: PROJECTS.filter(p => p.branch === b.name && p.status === 'In Progress').length },
        { label: 'Status', value: b.status, badge: true }
      ] };
  }
  return null;
}
