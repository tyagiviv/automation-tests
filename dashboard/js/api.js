// api.js
export async function fetchRuns(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `/api/runs?${qs}` : '/api/runs';
  const res = await fetch(url);
  return res.json();
}

export async function fetchArchive() {
  const res = await fetch('/api/archive');
  return res.json();
}
