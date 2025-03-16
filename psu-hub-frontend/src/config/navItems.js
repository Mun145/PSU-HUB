const navItems = [
  { label: 'Home', path: '/', roles: [null, 'faculty', 'admin', 'psu_admin'] },
  { label: 'Login', path: '/login', roles: [null] },
  { label: 'Register', path: '/register', roles: [null] },
  { label: 'My Attendance', path: '/my-attendance', roles: ['faculty', 'admin', 'psu_admin'] },
  { label: 'Dashboard', path: '/dashboard', roles: ['faculty', 'admin', 'psu_admin'] },
  { label: 'Create Event', path: '/create-event', roles: ['admin'] },
  { label: 'Analytics', path: '/analytics', roles: ['admin'] },
  { label: 'Pending Events', path: '/pending-events', roles: ['psu_admin'] },
  { label: 'Profile', path: '/profile', roles: ['faculty', 'admin', 'psu_admin'] },
  { label: 'Logout', path: '/logout', roles: ['faculty', 'admin', 'psu_admin'] }
];

export default navItems;
