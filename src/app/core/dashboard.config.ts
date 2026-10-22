import { Role, User } from './models';
import { Column } from './list-configs';
import { ENTERPRISES, INVITATIONS, LOGS, PLATFORM_USERS, PROJECTS, REPORTS, USERS, BRANCHES, DEPARTMENTS } from './mock-data';

export interface DashStat { label: string; value: string | number; icon: string; sub?: string; highlight?: boolean; }
export interface Slice { label: string; value: number; }
export interface DashConfig {
  title: string; subtitle: string; banner?: { label: string; value: string };
  stats: DashStat[];
  chart: { title: string; data: number[]; labels: string[] };
  donut: { title: string; slices: Slice[] };
  bars: { title: string; items: { label: string; value: number; text: string }[] };
  recent: { title: string; columns: Column[]; rows: any[]; link: string; linkLabel: string };
  list: { title: string; empty: string; items: { primary: string; secondary: string; badge?: string }[] };
  actions: { label: string; icon: string; link: string }[];
}

const cnt = (a: any[], f: (x: any) => boolean) => a.filter(f).length;
const pct = (n: number, t: number) => (t ? Math.round((n * 100) / t) : 0);
const monthLabels = (locale: string) => [4, 5, 6, 7, 8, 9].map(m => new Date(2026, m, 1).toLocaleDateString(locale, { month: 'short' }));

const projectSlices = (ps: any[]): Slice[] =>
  ['In Progress', 'Completed', 'Delayed', 'Paused', 'Not Started'].map(s => ({ label: s, value: cnt(ps, p => p.status === s) })).filter(s => s.value > 0);
const reportSlices = (rs: any[]): Slice[] =>
  ['Approved', 'Awaiting Review', 'Needs Correction', 'Rejected'].map(s => ({ label: s, value: cnt(rs, r => r.reviewStatus === s) })).filter(s => s.value > 0);
const reportBars = (rs: any[]) => reportSlices(rs).map(s => ({ label: s.label, value: pct(s.value, rs.length), text: s.value + ' (' + pct(s.value, rs.length) + '%)' }));
const pendingList = (rs: any[], t: (s: string, p?: any) => string) => rs.filter(r => r.reviewStatus === 'Awaiting Review').map(r => ({ primary: r.employee, secondary: r.projects.map((p: string) => t(p)).join(', ') + ' · ' + r.submittedAt, badge: 'Awaiting Review' }));

export function nextMonday(locale = 'en-GB'): string {
  const d = new Date();
  const add = ((8 - d.getDay()) % 7) || 7;
  d.setDate(d.getDate() + add);
  return d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
}

export function buildDashboard(role: Role, user: User, t: (s: string, p?: any) => string = s => s, locale = 'en-GB'): DashConfig {
  const name = user.firstName + ' ' + user.lastName;
  const months = monthLabels(locale);

  if (role === 'super_admin') {
    const a = cnt(ENTERPRISES, e => e.status === 'Active');
    return {
      title: 'Super Admin Dashboard', subtitle: 'Here is the state of the whole platform.',
      stats: [
        { label: 'Total enterprises', value: ENTERPRISES.length, icon: 'building', sub: 'Registered on the platform' },
        { label: 'Active enterprises', value: a, icon: 'check-square', sub: 'Currently operating' },
        { label: 'Suspended enterprises', value: ENTERPRISES.length - a, icon: 'pause', sub: 'Access suspended', highlight: true },
        { label: 'Total users', value: PLATFORM_USERS.length, icon: 'users', sub: 'Across all enterprises' },
        { label: 'Pending invitations', value: cnt(INVITATIONS, i => i.status === 'Pending'), icon: 'mail', sub: 'Waiting for a response' },
        { label: 'Accepted invitations', value: cnt(INVITATIONS, i => i.status === 'Accepted'), icon: 'check', sub: 'Accounts activated' }
      ],
      chart: { title: 'Enterprises registered (cumulative)', data: [0, 1, 1, 2, 4, 6], labels: months },
      donut: { title: 'Enterprise status', slices: [{ label: 'Active', value: a }, { label: 'Suspended', value: ENTERPRISES.length - a }] },
      bars: { title: 'Invitation status', items: ['Accepted', 'Pending', 'Expired', 'Revoked'].map(s => { const n = cnt(INVITATIONS, i => i.status === s); return { label: s, value: pct(n, INVITATIONS.length), text: n + ' (' + pct(n, INVITATIONS.length) + '%)' }; }) },
      recent: { title: 'Recently created enterprises', link: '{base}/enterprises', linkLabel: 'View all enterprises',
        columns: [{ key: 'name', label: 'Enterprise' }, { key: 'email', label: 'Email' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'createdAt', label: 'Created' }],
        rows: [...ENTERPRISES].reverse().slice(0, 4) },
      list: { title: 'Recent platform activity', empty: 'No recent activity.', items: LOGS.slice(0, 5).map(l => ({ primary: t(l.action) + ' · ' + l.target, secondary: l.actor + ' · ' + l.time })) },
      actions: [{ label: 'Create Enterprise', icon: 'plus', link: '{base}/enterprises/new' }, { label: 'Send Invitation', icon: 'mail', link: '{base}/invitations/new' }]
    };
  }

  if (role === 'company_admin') {
    return {
      title: 'Company Dashboard', subtitle: 'Here is the current state of your enterprise.', banner: { label: 'Enterprise', value: user.enterprise },
      stats: [
        { label: 'Total employees', value: cnt(USERS, u => u.role === 'Employee'), icon: 'users', sub: 'Active staff' },
        { label: 'Total interns', value: cnt(USERS, u => u.role === 'Intern'), icon: 'user', sub: 'Current interns' },
        { label: 'Reports awaiting review', value: cnt(REPORTS, r => r.reviewStatus === 'Awaiting Review'), icon: 'clock', sub: 'Need a decision', highlight: true },
        { label: 'Branch managers', value: cnt(USERS, u => u.role === 'Branch Manager'), icon: 'check-square', sub: 'Across branches' },
        { label: 'Total branches', value: BRANCHES.length, icon: 'branch' },
        { label: 'Total departments', value: DEPARTMENTS.length, icon: 'layers' },
        { label: 'Total projects', value: PROJECTS.length, icon: 'folder' },
        { label: 'Active projects', value: cnt(PROJECTS, p => p.status === 'In Progress'), icon: 'activity' },
        { label: 'Completed projects', value: cnt(PROJECTS, p => p.status === 'Completed'), icon: 'check' },
        { label: 'Approved reports', value: cnt(REPORTS, r => r.reviewStatus === 'Approved'), icon: 'file' }
      ],
      chart: { title: 'Reports submitted per month', data: [8, 12, 15, 14, 19, 22], labels: months },
      donut: { title: 'Project status', slices: projectSlices(PROJECTS) },
      bars: { title: 'Report review status', items: reportBars(REPORTS) },
      recent: { title: 'Recent projects', link: '{base}/projects', linkLabel: 'View all projects',
        columns: [{ key: 'id', label: 'ID' }, { key: 'name', label: 'Project' }, { key: 'status', label: 'Status', type: 'badge' }, { key: 'plannedFinish', label: 'Planned finish' }],
        rows: PROJECTS.slice(0, 4) },
      list: { title: 'Pending review', empty: 'No reports are waiting for review.', items: pendingList(REPORTS, t) },
      actions: [{ label: 'Add User', icon: 'plus', link: '{base}/users/new' }, { label: 'Create Project', icon: 'folder', link: '{base}/projects/new' }, { label: 'Export Reports', icon: 'download', link: '{base}/export' }]
    };
  }

  if (role === 'branch_manager') {
    const ps = PROJECTS.filter(p => p.branch === user.branch);
    const people = USERS.filter(u => u.branch === user.branch && (u.role === 'Employee' || u.role === 'Intern'));
    const miss = people.filter(u => u.weeklyReport === 'Missing');
    return {
      title: 'Branch Dashboard', subtitle: 'Here is what is happening in your branch.', banner: { label: 'Branch', value: user.branch ?? '' },
      stats: [
        { label: 'Total employees', value: cnt(people, u => u.role === 'Employee'), icon: 'users' },
        { label: 'Total interns', value: cnt(people, u => u.role === 'Intern'), icon: 'user' },
        { label: 'Reports awaiting review', value: cnt(REPORTS, r => r.reviewStatus === 'Awaiting Review'), icon: 'clock', sub: 'Need your decision', highlight: true },
        { label: 'Total projects', value: ps.length, icon: 'folder' },
        { label: 'Active projects', value: cnt(ps, p => p.status === 'In Progress'), icon: 'activity' },
        { label: 'Completed projects', value: cnt(ps, p => p.status === 'Completed'), icon: 'check' },
        { label: 'Delayed projects', value: cnt(ps, p => p.status === 'Delayed'), icon: 'alert' },
        { label: 'Approved reports', value: cnt(REPORTS, r => r.reviewStatus === 'Approved'), icon: 'file' },
        { label: 'Needing correction', value: cnt(REPORTS, r => r.reviewStatus === 'Needs Correction'), icon: 'refresh' },
        { label: 'Missing weekly reports', value: miss.length, icon: 'x', sub: 'Not yet submitted' }
      ],
      chart: { title: 'Reports submitted per month', data: [4, 6, 8, 7, 10, 12], labels: months },
      donut: { title: 'Project status', slices: projectSlices(ps) },
      bars: { title: 'Weekly report submissions', items: [
        { label: 'Submitted', value: pct(people.length - miss.length, people.length), text: (people.length - miss.length) + ' / ' + people.length },
        { label: 'Missing', value: pct(miss.length, people.length), text: miss.length + ' / ' + people.length }] },
      recent: { title: 'Reports awaiting your review', link: '{base}/reviews', linkLabel: 'Open report reviews',
        columns: [{ key: 'id', label: 'Report' }, { key: 'employee', label: 'Employee' }, { key: 'projects', label: 'Projects', type: 'tags' }, { key: 'submittedAt', label: 'Submitted' }],
        rows: REPORTS.filter(r => r.reviewStatus === 'Awaiting Review') },
      list: { title: 'Employees who have not submitted', empty: 'Everyone has submitted this week.', items: miss.map(u => ({ primary: u.name, secondary: t(u.role) + ' · ' + t(u.department), badge: 'Missing' })) },
      actions: [{ label: 'Report Reviews', icon: 'check-square', link: '{base}/reviews' }, { label: 'Project Progress', icon: 'chart', link: '{base}/progress' }]
    };
  }

  // employee / intern
  const mine = REPORTS.filter(r => r.employee === name);
  const myProjects = PROJECTS.filter(p => p.team.includes(name));
  const isIntern = role === 'intern';
  const feedback = mine.flatMap(r => r.comments.map((c: any) => ({ primary: t(c.text), secondary: c.by + ' · ' + r.id + ' · ' + c.at, badge: c.decision })));
  return {
    title: isIntern ? 'Intern Dashboard' : 'Employee Dashboard', subtitle: 'Here is a summary of your work.', banner: { label: 'Branch', value: user.branch ?? '' },
    stats: [
      { label: 'Assigned projects', value: myProjects.length, icon: 'folder' },
      { label: isIntern ? 'Activities completed' : 'Projects in progress', value: isIntern ? cnt(mine, r => r.activityStatus === 'Completed') : cnt(myProjects, p => p.status === 'In Progress'), icon: 'activity' },
      { label: 'Next reporting date', value: nextMonday(locale), icon: 'clock', sub: 'Reports open on Mondays', highlight: true },
      { label: isIntern ? 'Weekly reports submitted' : 'Reports submitted', value: mine.length, icon: 'send' },
      { label: isIntern ? 'Awaiting approval' : 'Reports approved', value: isIntern ? cnt(mine, r => r.reviewStatus === 'Awaiting Review') : cnt(mine, r => r.reviewStatus === 'Approved'), icon: 'check' },
      { label: 'Needing correction', value: cnt(mine, r => r.reviewStatus === 'Needs Correction'), icon: 'refresh' },
      ...(isIntern ? [{ label: 'Branch manager feedback', value: feedback.length, icon: 'mail', sub: 'Comments received' }] : [])
    ],
    chart: { title: 'My reports per month', data: [0, 1, 2, 2, 3, 4], labels: months },
    donut: { title: 'My report status', slices: reportSlices(mine) },
    bars: { title: 'Project progress', items: myProjects.map(p => ({ label: p.name, value: p.progress, text: p.progress + '%' })) },
    recent: { title: 'Recent activity reports', link: '{base}/reports', linkLabel: 'View all my reports',
      columns: [{ key: 'id', label: 'Report' }, { key: 'projects', label: 'Projects', type: 'tags' }, { key: 'reviewStatus', label: 'Review status', type: 'badge' }, { key: 'submittedAt', label: 'Submitted' }],
      rows: mine.slice(0, 4) },
    list: { title: isIntern ? 'Branch manager feedback' : 'Latest review comments', empty: 'No feedback yet.', items: feedback.slice(0, 4) },
    actions: [{ label: 'Submit Weekly Report', icon: 'send', link: '{base}/submit-report' }]
  };
}
