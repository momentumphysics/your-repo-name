import './style.css';

// State navigasi wizard
const steps = {
  1: document.getElementById('step-1'),
  2: document.getElementById('step-2'),
  3: document.getElementById('step-3'),
  4: document.getElementById('step-4'),
};

let currentStep = 1;

// Data yang akan dikirim ke backend
const formData = {
  username: '',
  latitude: null,
  longitude: null,
  birthdate: ''
};

function goToStep(stepNumber) {
  if (steps[currentStep]) {
    steps[currentStep].classList.add('hidden');
  }
  currentStep = stepNumber;
  if (steps[currentStep]) {
    steps[currentStep].classList.remove('hidden');
  }
}

// LANGKAH 1 (Username)
const usernameInput = document.getElementById('username-input');
const btnStep1 = document.getElementById('btn-step-1');

usernameInput.addEventListener('input', () => {
  const isFilled = usernameInput.value.trim().length > 0;
  btnStep1.disabled = !isFilled;

  if (isFilled) {
    btnStep1.classList.remove('btn-disabled');
  } else {
    btnStep1.classList.add('btn-disabled');
  }
});

btnStep1.addEventListener('click', () => {
  const val = usernameInput.value.trim();
  if (val.length > 0) {
    formData.username = val;
    goToStep(2);
  }
});

// LANGKAH 2 (Region / Lokasi)
const btnReqLocation = document.getElementById('btn-req-location');
const btnStep2Next = document.getElementById('btn-step-2-next');
const locationStatus = document.getElementById('location-status');

btnReqLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Geolocation tidak didukung browser ini.';
    return;
  }

  locationStatus.textContent = 'Memeriksa lokasi...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      formData.latitude = position.coords.latitude;
      formData.longitude = position.coords.longitude;

      locationStatus.innerHTML = `<span style="color: var(--primary-blue); font-weight: 600;">Wilayah terdeteksi:</span> Lat ${formData.latitude.toFixed(3)}, Long ${formData.longitude.toFixed(3)}`;
      setTimeout(() => goToStep(3), 800);
    },
    () => {
      locationStatus.textContent = 'Izin lokasi tidak diberikan. Melanjutkan secara manual.';
    },
    { enableHighAccuracy: false, timeout: 5000 }
  );
});

btnStep2Next.addEventListener('click', () => {
  goToStep(3);
});

// LANGKAH 3 (Tanggal Lahir & Kirim ke Backend)
const dobInput = document.getElementById('dob-input');
const btnStep3 = document.getElementById('btn-step-3');

btnStep3.addEventListener('click', async () => {
  formData.birthdate = dobInput.value || null;

  btnStep3.disabled = true;
  btnStep3.textContent = 'Menyimpan...';

  try {
    // Mengirim data ke backend Node.js
    const response = await fetch('http://localhost:3001/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      goToStep(4);
    } else {
      alert('Gagal menyimpan ke database server.');
    }
  } catch (error) {
    console.error('Error saat koneksi ke backend:', error);
    alert('Tidak dapat terhubung ke server backend.');
  } finally {
    btnStep3.disabled = false;
    btnStep3.textContent = 'Finish';
  }
});

// Reset Form
const btnRestart = document.getElementById('btn-restart');
if (btnRestart) {
  btnRestart.addEventListener('click', () => {
    formData.username = '';
    formData.latitude = null;
    formData.longitude = null;
    formData.birthdate = '';
    usernameInput.value = '';
    dobInput.value = '';
    btnStep1.disabled = true;
    btnStep1.classList.add('btn-disabled');
    locationStatus.textContent = 'Izin lokasi belum diminta.';
    goToStep(1);
  });
}

// Tutup Banner
const btnCloseBanner = document.getElementById('btn-close-banner');
const bottomBanner = document.getElementById('bottom-banner');

btnCloseBanner.addEventListener('click', () => {
  bottomBanner.style.display = 'none';
});
