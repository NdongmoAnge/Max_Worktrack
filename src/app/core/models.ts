export type Role = 'super_admin' | 'company_admin' | 'branch_manager' | 'employee' | 'intern';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  enterprise: string;
  branch?: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  company_admin: 'Company Admin',
  branch_manager: 'Branch Manager',
  employee: 'Employee',
  intern: 'Intern'
};

export const ROLE_BASE: Record<Role, string> = {
  super_admin: '/super-admin',
  company_admin: '/company-admin',
  branch_manager: '/branch-manager',
  employee: '/employee',
  intern: '/intern'
};
