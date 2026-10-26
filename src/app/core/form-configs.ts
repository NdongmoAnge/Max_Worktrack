import { User } from './models';
import { BRANCHES, DEPARTMENTS, ENTERPRISES, PROJECTS, USERS } from './mock-data';

export type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'multiselect' | 'date' | 'file' | 'activities';

export interface Field {
  key: string; label: string; type: FieldType; required?: boolean;
  options?: string[] | ((u: User) => string[]);
  placeholder?: string; hint?: string; readonly?: boolean; createOnly?: boolean; requiredMsg?: string; defaultValue?: string;
}

export interface FormConfig {
  title: string; editTitle?: string; editSubmitLabel?: string; crumbs: string[]; fields: Field[];
  submitLabel: string; successMessage: string; updateMessage?: string; confirmMessage?: string;
  listLink: string; mondayOnly?: boolean;
  dateRange?: { start: string; end: string; message: string };
}

const uniq = (a: string[]) => Array.from(new Set(a));
const branchNames = BRANCHES.map(b => b.name);
const deptNames = uniq(DEPARTMENTS.map(d => d.name));
const managers = USERS.filter(u => u.role === 'Branch Manager').map(u => u.name);

export const FORM_CONFIGS: Record<string, FormConfig> = {
  enterprise: {
    title: 'Create Enterprise', editTitle: 'Edit Enterprise', crumbs: ['Enterprises', 'Create'],
    submitLabel: 'Create Enterprise', listLink: '{base}/enterprises',
    successMessage: 'Enterprise created successfully. The administrator invitation has been initiated.',
    updateMessage: 'Enterprise updated successfully.',
    confirmMessage: 'You are about to create this enterprise and start the Company Admin invitation. Do you want to continue?',
    fields: [
      { key: 'name', label: 'Enterprise Name', type: 'text', required: true, requiredMsg: 'Please enter the enterprise name.' },
      { key: 'email', label: 'Enterprise Email', type: 'email', required: true, requiredMsg: 'Please enter the enterprise email.' },
      { key: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+237 ...' },
      { key: 'defaultLanguage', label: 'Default language', type: 'select', required: true, options: ['English', 'French'], defaultValue: 'English', hint: 'Used for all users of this enterprise until they choose their own language.', requiredMsg: 'Please select the default language.' },
      { key: 'logo', label: 'Enterprise Logo', type: 'file', hint: 'Optional. PNG or JPG.' },
      { key: 'address', label: 'Address', type: 'textarea' },
      { key: 'adminFirstName', label: 'Company Admin First Name', type: 'text', required: true, createOnly: true, requiredMsg: 'Please enter the administrator\'s first name.' },
      { key: 'adminLastName', label: 'Company Admin Last Name', type: 'text', required: true, createOnly: true, requiredMsg: 'Please enter the administrator\'s last name.' },
      { key: 'adminEmail', label: 'Company Admin Email', type: 'email', required: true, createOnly: true, requiredMsg: 'Please enter the administrator\'s email.' }
    ]
  },
  invitation: {
    title: 'Send Invitation', crumbs: ['Invitations', 'Send'], submitLabel: 'Send Invitation', listLink: '{base}/invitations',
    successMessage: 'Invitation sent successfully.',
    fields: [
      { key: 'enterprise', label: 'Enterprise', type: 'select', required: true, options: ENTERPRISES.map(e => e.name), requiredMsg: 'Please select an enterprise.' },
      { key: 'firstName', label: 'Company Admin First Name', type: 'text', required: true, requiredMsg: 'Please enter the first name.' },
      { key: 'lastName', label: 'Company Admin Last Name', type: 'text', required: true, requiredMsg: 'Please enter the last name.' },
      { key: 'email', label: 'Company Admin Email', type: 'email', required: true, requiredMsg: 'Please enter the email address.' }
    ]
  },
  user: {
    title: 'Invite User', editTitle: 'Edit User', crumbs: ['Users', 'Invite'], submitLabel: 'Send Invitation', editSubmitLabel: 'Save changes', listLink: '{base}/users',
    successMessage: 'Invitation sent by email. The user can now activate the account.', updateMessage: 'User updated successfully.',
    fields: [
      { key: 'firstName', label: 'First Name', type: 'text', required: true, requiredMsg: 'Please enter the first name.' },
      { key: 'lastName', label: 'Last Name', type: 'text', required: true, requiredMsg: 'Please enter the last name.' },
      { key: 'email', label: 'Email', type: 'email', required: true, requiredMsg: 'Please enter the email address.', hint: 'The invitation is sent to this email address.' },
      { key: 'role', label: 'Role', type: 'select', required: true, options: ['Branch Manager', 'Employee', 'Intern'], requiredMsg: 'Please select a role.' },
      { key: 'branch', label: 'Branch', type: 'select', required: true, options: branchNames, requiredMsg: 'Please select a branch.' },
      { key: 'department', label: 'Department', type: 'select', required: true, options: deptNames, requiredMsg: 'Please select a department.' }
    ]
  },
  branch: {
    title: 'Create Branch', editTitle: 'Edit Branch', crumbs: ['Branches', 'Create'], submitLabel: 'Save Branch', listLink: '{base}/branches',
    successMessage: 'Branch created successfully.', updateMessage: 'Branch updated successfully.',
    fields: [
      { key: 'name', label: 'Branch Name', type: 'text', required: true, requiredMsg: 'Please enter the branch name.' },
      { key: 'city', label: 'City', type: 'text', required: true, requiredMsg: 'Please enter the city.' },
      { key: 'manager', label: 'Branch Manager', type: 'select', options: managers }
    ]
  },
  department: {
    title: 'Create Department', editTitle: 'Edit Department', crumbs: ['Departments', 'Create'], submitLabel: 'Save Department', listLink: '{base}/departments',
    successMessage: 'Department created successfully.', updateMessage: 'Department updated successfully.',
    fields: [
      { key: 'name', label: 'Department Name', type: 'text', required: true, requiredMsg: 'Please enter the department name.' },
      { key: 'branch', label: 'Branch', type: 'select', required: true, options: branchNames, requiredMsg: 'Please select a branch.' },
      { key: 'head', label: 'Department Head', type: 'select', options: USERS.map(u => u.name) }
    ]
  },
  project: {
    title: 'Create Project', editTitle: 'Edit Project', crumbs: ['Projects', 'Create'], submitLabel: 'Save Project', listLink: '{base}/projects',
    successMessage: 'Project created successfully. The project ID has been generated.', updateMessage: 'Project updated successfully.',
    dateRange: { start: 'plannedStart', end: 'plannedFinish', message: 'The planned finish date cannot be earlier than the planned start date.' },
    fields: [
      { key: 'name', label: 'Project Name', type: 'text', required: true, requiredMsg: 'Please enter the project name.' },
      { key: 'status', label: 'Project Status', type: 'select', required: true, options: ['Not Started', 'In Progress', 'Paused', 'Completed'], hint: 'Delays are calculated by the system.', requiredMsg: 'Please select a project status.' },
      { key: 'plannedStart', label: 'Planned Start Date', type: 'date', required: true, requiredMsg: 'Please select the planned start date.' },
      { key: 'plannedFinish', label: 'Planned Finish Date', type: 'date', required: true, requiredMsg: 'Please select the planned finish date.' },
      { key: 'manager', label: 'Project Manager (Branch Manager)', type: 'select', required: true, options: managers, requiredMsg: 'Please select a project manager.' },
      { key: 'description', label: 'Project Description', type: 'textarea', required: true, requiredMsg: 'Please enter a project description.' },
      { key: 'team', label: 'Assigned Users', type: 'multiselect', required: true, options: USERS.filter(u => u.role !== 'Branch Manager').map(u => u.name), requiredMsg: 'Please assign at least one user.' }
    ]
  },
  report: {
    title: 'Submit Weekly Report', editTitle: 'Edit Weekly Report', crumbs: ['Reports', 'Submit'], submitLabel: 'Submit Report', editSubmitLabel: 'Save changes', listLink: '{base}/reports', mondayOnly: true,
    successMessage: 'Weekly report submitted successfully. It is now awaiting branch manager review.',
    updateMessage: 'Weekly report updated. It is awaiting branch manager review again.',
    confirmMessage: 'Are you sure you want to submit this weekly report?',
    fields: [
      { key: 'employeeName', label: 'Employee Name', type: 'text', readonly: true, required: true },
      { key: 'entries', label: 'Project activities', type: 'activities',
        hint: 'You can report work on several projects in the same week. Add one activity for each project.',
        options: (u: User) => PROJECTS.filter(p => p.team.includes(u.firstName + ' ' + u.lastName)).map(p => p.name) }
    ]
  }
};
