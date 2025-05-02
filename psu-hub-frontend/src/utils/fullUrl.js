/**
 * Return an absolute URL usable in <img src> or <a href>.
 *  • If `path` already starts with http/https  → return as‑is.
 *  • If it starts with /uploads               → prepend the BACKEND origin.
 *  • Else                                    → prepend REACT_APP_API_URL.
 */
export default function fullUrl(path) {
  if (!path) return '';

  // already absolute
  if (/^https?:\/\//i.test(path)) return path;

  /* --------------------------------------------------------------------
   *  /uploads/…  ->  use the BACKEND origin
   *  --------------------------------------------------                */
  if (path.startsWith('/uploads')) {
    // In dev we have:   REACT_APP_SOCKET_URL = 'http://localhost:3001'
    // In prod you can point it to https://api.your‑domain.com
    const backend = (process.env.REACT_APP_SOCKET_URL || '').replace(/\/$/, '');
    return backend ? `${backend}${path}` : `${window.location.origin}${path}`;
  }

  /* --------------------------------------------------------------------
   *  Anything else (e.g. /events/123) ->  hang off the API root
   *  --------------------------------------------------                */
  const apiRoot = (process.env.REACT_APP_API_URL || '/api').replace(/\/$/, '');
  return `${apiRoot}${path}`;
}
