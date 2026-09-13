// Endpoint menggunakan relative path jika di-serve oleh Express
// Jika frontend dibuka terpisah (misal Live Server: 5500), arahkan ke URL backend
const API_BASE = window.location.port === '5500'
  ? 'http://localhost:3000/api'
  : '/api';

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
