import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isOwner,
  isUserAdmin,
  canAccessAdminStudio,
  filterStudentsRoster,
  validateStudentRegistration,
  BOOTSTRAP_ADMIN_EMAIL,
  LIVE_PUBLIC_URL,
} from './rbacLogic.ts';

test('isOwner correctly identifies website owner email uutkarsh319@gmail.com', () => {
  assert.equal(isOwner({ email: 'uutkarsh319@gmail.com' }), true);
  assert.equal(isOwner({ email: 'UUTKARSH319@GMAIL.COM' }), true);
  assert.equal(isOwner({ email: 'other@gmail.com' }), false);
  assert.equal(isOwner(null), false);
  assert.equal(isOwner(undefined), false);
  assert.equal(typeof LIVE_PUBLIC_URL, 'string');
});

test('isUserAdmin correctly grants admin status to bootstrap email', () => {
  assert.equal(isUserAdmin({ email: 'uutkarsh319@gmail.com', role: 'student' }), true);
  assert.equal(isUserAdmin({ email: 'UUTKARSH319@GMAIL.COM', role: 'student' }), true);
  assert.equal(isUserAdmin({ email: 'random.student@campus.edu', role: 'student' }), false);
  assert.equal(isUserAdmin({ email: 'random.student@campus.edu', role: 'admin' }), true);
  assert.equal(isUserAdmin(null), false);
  assert.equal(isUserAdmin(undefined), false);
});

test('canAccessAdminStudio forbids students and allows website owner / verified admins', () => {
  const student = { email: 'student1@gmail.com', role: 'student' };
  const admin = { email: 'uutkarsh319@gmail.com', role: 'admin' };
  const owner = { email: 'uutkarsh319@gmail.com', role: 'student' };

  assert.equal(canAccessAdminStudio(student), false);
  assert.equal(canAccessAdminStudio(admin), true);
  assert.equal(canAccessAdminStudio(owner), true);
});

test('filterStudentsRoster accurately filters students by search term, track, and CGPA tier', () => {
  const cohort = [
    {
      id: '1',
      name: 'Aarav Sharma',
      email: 'aarav@gmail.com',
      role: 'student',
      cgpa: 8.8,
      areaOfInterest: 'Frontend Developer',
      college: 'NIT Trichy',
      graduationYear: 2026,
    },
    {
      id: '2',
      name: 'Priya Patel',
      email: 'priya@gmail.com',
      role: 'student',
      cgpa: 9.5,
      areaOfInterest: 'AI / ML Engineer',
      college: 'IIT Delhi',
      graduationYear: 2026,
    },
    {
      id: '3',
      name: 'Rahul Verma',
      email: 'rahul@gmail.com',
      role: 'student',
      cgpa: 9.1,
      areaOfInterest: 'Backend Developer',
      college: 'BITS Pilani',
      graduationYear: 2026,
    },
    {
      id: '4',
      name: 'David Miller',
      email: 'david@gmail.com',
      role: 'student',
      cgpa: 7.9,
      areaOfInterest: 'DevOps & Cloud',
      college: 'State Tech',
      graduationYear: 2027,
    },
  ];

  // Search query
  const searchResult = filterStudentsRoster(cohort, 'BITS', 'All', 'all');
  assert.equal(searchResult.length, 1);
  assert.equal(searchResult[0].name, 'Rahul Verma');

  // Track filter
  const trackResult = filterStudentsRoster(cohort, '', 'AI / ML Engineer', 'all');
  assert.equal(trackResult.length, 1);
  assert.equal(trackResult[0].name, 'Priya Patel');

  // CGPA filter 9.0+
  const honorsResult = filterStudentsRoster(cohort, '', 'All', '9plus');
  assert.equal(honorsResult.length, 2); // Priya (9.5) and Rahul (9.1)

  // CGPA filter 8.0+
  const firstClassResult = filterStudentsRoster(cohort, '', 'All', '8plus');
  assert.equal(firstClassResult.length, 3); // Priya (9.5), Rahul (9.1), Aarav (8.8)
});

test('validateStudentRegistration validates academic student registration inputs', () => {
  const validPayload = {
    id: 'usr-123',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@gmail.com',
    cgpa: 8.7,
    college: 'Delhi Technological University',
    areaOfInterest: 'Software Developer',
    graduationYear: 2026,
  };
  assert.deepEqual(validateStudentRegistration(validPayload), { valid: true });

  // Invalid CGPA > 10
  const invalidCgpa = { ...validPayload, cgpa: 11.5 };
  assert.equal(validateStudentRegistration(invalidCgpa).valid, false);

  // Missing college
  const missingCollege = { ...validPayload, college: '' };
  assert.equal(validateStudentRegistration(missingCollege).valid, false);

  // Invalid email
  const invalidEmail = { ...validPayload, email: 'not-an-email' };
  assert.equal(validateStudentRegistration(invalidEmail).valid, false);
});
