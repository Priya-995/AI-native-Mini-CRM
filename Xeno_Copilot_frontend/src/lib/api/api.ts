const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function fetchCustomers() {
  const res = await fetch(`${API}/customers`);
  return res.json();
}

export async function fetchCampaigns() {
  const res = await fetch(`${API}/campaigns`);
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API}/stats`);
  return res.json();
}