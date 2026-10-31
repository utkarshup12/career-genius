/**
 * Pure helper functions for Role-Based Access Control and Student Directory filtering
 */

export const BOOTSTRAP_ADMIN_EMAIL = 'uutkarsh319@gmail.com';

export function isUserAdmin(user: { email?: string | null; role?: string } | null | undefined): boolean {
  if (!user) return false;
  if (user.email && user.email.trim().toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
    return true;
  }
  return user.role === 'admin';
}

export function canAccessAdminStudio(user: { email?: string | null; role?: string } | null | undefined): boolean {
  return isUserAdmin(user);
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  cgpa: number;
  areaOfInterest: string;
  college: string;
  graduationYear: number;
}

export function filterStudentsRoster(
  students: StudentRecord[],
  searchQuery: string,
  trackFilter: string,
  cgpaFilter: 'all' | '9plus' | '8plus'
): StudentRecord[] {
  const query = searchQuery.trim().toLowerCase();

  return students.filter((s) => {
    const matchesSearch =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.college.toLowerCase().includes(query) ||
      s.areaOfInterest.toLowerCase().includes(query);

    const matchesTrack = trackFilter === 'All' || s.areaOfInterest === trackFilter;

    const matchesCgpa =
      cgpaFilter === 'all' ||
      (cgpaFilter === '9plus' && s.cgpa >= 9.0) ||
      (cgpaFilter === '8plus' && s.cgpa >= 8.0);

    return matchesSearch && matchesTrack && matchesCgpa;
  });
}

export function validateStudentRegistration(data: Partial<StudentRecord>): { valid: boolean; error?: string } {
  if (!data.id || typeof data.id !== 'string') {
    return { valid: false, error: 'User ID is required' };
  }
  if (!data.name || data.name.trim().length === 0) {
    return { valid: false, error: 'Student name cannot be empty' };
  }
  if (!data.email || !data.email.includes('@')) {
    return { valid: false, error: 'Valid Gmail or email address is required' };
  }
  if (typeof data.cgpa !== 'number' || data.cgpa < 0 || data.cgpa > 10) {
    return { valid: false, error: 'CGPA must be a number between 0.0 and 10.0' };
  }
  if (!data.college || data.college.trim().length === 0) {
    return { valid: false, error: 'College / University name is required' };
  }
  if (!data.areaOfInterest || data.areaOfInterest.trim().length === 0) {
    return { valid: false, error: 'Target career track / area of interest is required' };
  }
  return { valid: true };
}
