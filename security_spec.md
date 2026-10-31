# Security Specification: Career Genius RBAC & User Collections

## 1. Data Invariants
1. **User Identity Boundary**: A user document in `users/{userId}` can only be created or modified by the authenticated user whose `request.auth.uid == userId`, or modified/managed by an authorized administrator.
2. **Student Access Fence**: Students cannot read arbitrary other students' private user documents or list the `users` collection.
3. **Administrator Privilege**: Authorized platform admins (`uutkarsh319@gmail.com` or users in `admins/{adminId}`) have full list and read permissions across all registered student profiles in `users/{userId}` so they can monitor student cohorts.
4. **Verified Credentials**: Google Sign-In users must have `request.auth.token.email_verified == true` for state-changing writes.
5. **No Self-Promoting Roles**: Students cannot self-assign `role: "admin"`. The default or created role must be `student` unless authenticated as the bootstrapped administrator `uutkarsh319@gmail.com`.
6. **Path Hardening**: Path variables such as `userId` and `adminId` must pass `isValidId()` regex and length restrictions (<= 128 chars).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Attacker attempts to create a profile under another user's UID**:
   - `setDoc(doc(db, 'users', 'victim_uid'), { id: 'victim_uid', role: 'student', email: 'victim@domain.com' })`
   - Expected: `PERMISSION_DENIED`
2. **Student attempts to escalate role to admin during profile creation**:
   - `setDoc(doc(db, 'users', 'student_uid'), { id: 'student_uid', role: 'admin', email: 'student@domain.com' })`
   - Expected: `PERMISSION_DENIED`
3. **Student attempts to query/list all registered students in `/users`**:
   - `getDocs(collection(db, 'users'))` by student
   - Expected: `PERMISSION_DENIED`
4. **Student attempts to read another student's profile directly**:
   - `getDoc(doc(db, 'users', 'other_student_uid'))` by student
   - Expected: `PERMISSION_DENIED`
5. **Attacker attempts document ID poisoning with 10KB string**:
   - `setDoc(doc(db, 'users', 'a'.repeat(5000)), { ... })`
   - Expected: `PERMISSION_DENIED`
6. **Unauthenticated visitor attempts to read users**:
   - `getDoc(doc(db, 'users', 'any_uid'))` with `request.auth == null`
   - Expected: `PERMISSION_DENIED`
7. **Attacker attempts to write into `/admins` collection**:
   - `setDoc(doc(db, 'admins', 'attacker_uid'), { role: 'admin' })`
   - Expected: `PERMISSION_DENIED`
8. **Student attempts to update immutable user fields (e.g., id or original email)**:
   - `updateDoc(doc(db, 'users', 'my_uid'), { id: 'different_uid' })`
   - Expected: `PERMISSION_DENIED`
9. **User with unverified email attempts profile registration**:
   - `request.auth.token.email_verified == false`
   - Expected: `PERMISSION_DENIED`
10. **Attacker sends oversized string in `name` (> 100 chars) or `areaOfInterest` (> 100 chars)**:
    - Payload with 2000 chars in `name`
    - Expected: `PERMISSION_DENIED`
11. **Student attempts to delete another student's document**:
    - `deleteDoc(doc(db, 'users', 'victim_uid'))` by student
    - Expected: `PERMISSION_DENIED`
12. **Student attempts shadow update injection with unexpected privileged fields**:
    - `updateDoc(doc(db, 'users', 'my_uid'), { isSuperAdmin: true })`
    - Expected: `PERMISSION_DENIED`
