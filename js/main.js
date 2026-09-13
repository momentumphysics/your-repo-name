// Vite proxy automatically forwards '/api' requests to port 3000
const API_BASE = '/api';

async function checkBackendConnection() {
  const statusEl = document.getElementById('status-backend');

  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const data = await res.json();
    if (statusEl) {
      statusEl.textContent = `Status: ${data.message}`;
      statusEl.style.color = 'green';
    }
  } catch (error) {
    console.error('Gagal terhubung ke backend:', error);
    if (statusEl) {
      statusEl.textContent = 'Gagal terhubung ke server backend.';
      statusEl.style.color = 'red';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkBackendConnection();
});
