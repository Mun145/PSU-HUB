export default function fullUrl(path) {
  if (!path) return '';

  // already absolute
  if (/^https?:\/\//i.test(path)) return path;

  // handle static assets like certificates and uploads
  if (path.startsWith('/uploads') || path.startsWith('/certificates')) {
    const backend = (process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001').replace(/\/$/, '');
    return `${backend}${path}`;
  }

  // fallback to API root
  const apiRoot = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');
  return `${apiRoot}${path}`;
}
