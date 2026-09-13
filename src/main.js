// Navigasi State Wizard
const steps = {
  1: document.getElementById('step-1'),
  2: document.getElementById('step-2'),
  3: document.getElementById('step-3'),
  4: document.getElementById('step-4'),
};

let currentStep = 1;

function goToStep(stepNumber) {
  if (steps[currentStep]) {
    steps[currentStep].classList.add('hidden');
  }
  currentStep = stepNumber;
  if (steps[currentStep]) {
    steps[currentStep].classList.remove('hidden');
  }
}

// LOGIKA LANGKAH 1 (Username)
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
  if (usernameInput.value.trim().length > 0) {
    goToStep(2);
  }
});

// LOGIKA LANGKAH 2 (Region / Lokasi)
const btnReqLocation = document.getElementById('btn-req-location');
const btnStep2Next = document.getElementById('btn-step-2-next');
const locationStatus = document.getElementById('location-status');

btnReqLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Geolocation tidak didukung pada browser ini.';
    return;
  }

  locationStatus.textContent = 'Memeriksa izin lokasi...';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude.toFixed(3);
      const lon = position.coords.longitude.toFixed(3);
      locationStatus.innerHTML = `<span style="color: var(--primary-blue); font-weight: 600;">Wilayah terdeteksi:</span> Lat ${lat}, Long ${lon}`;

      setTimeout(() => goToStep(3), 800);
    },
    () => {
      locationStatus.textContent = 'Akses lokasi tidak diberikan. Anda dapat melanjutkan.';
    },
    { enableHighAccuracy: false, timeout: 5000 }
  );
});

btnStep2Next.addEventListener('click', () => {
  goToStep(3);
});

// LOGIKA LANGKAH 3 (Tanggal Lahir)
const btnStep3 = document.getElementById('btn-step-3');

btnStep3.addEventListener('click', () => {
  // Melanjutkan terlepas dari isi input tanggal lahir
  goToStep(4);
});

// ULANGI FORM
const btnRestart = document.getElementById('btn-restart');
if (btnRestart) {
  btnRestart.addEventListener('click', () => {
    usernameInput.value = '';
    btnStep1.disabled = true;
    btnStep1.classList.add('btn-disabled');
    locationStatus.textContent = 'Izin lokasi belum diminta.';
    goToStep(1);
  });
}

// TUTUP BANNER BAWAH
const btnCloseBanner = document.getElementById('btn-close-banner');
const bottomBanner = document.getElementById('bottom-banner');

btnCloseBanner.addEventListener('click', () => {
  bottomBanner.style.display = 'none';
});
