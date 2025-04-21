// Return an absolute URL no matter what we get from the backend.
// • If the string already starts with http/https → return as‑is.
// • Otherwise prepend the API root (REACT_APP_API_URL) or window.origin.
export default function fullUrl(path) {
    if (!path) return '';
    if (/^https?:\/\//i.test(path)) return path;
  
    const apiRoot = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
    if (apiRoot) return `${apiRoot}${path}`;
    return `${window.location.origin}${path}`;
  }
  