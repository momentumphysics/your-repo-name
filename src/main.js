const input = document.getElementById('account-input');
const btnNext = document.getElementById('btn-next');
const btnClose = document.getElementById('btn-close-banner');
const banner = document.getElementById('bottom-banner');

// Ubah status tombol Next berdasarkan isi input
input.addEventListener('input', () => {
  const isFilled = input.value.trim().length > 0;

  if (isFilled) {
    btnNext.disabled = false;
    btnNext.classList.remove('bg-[#25396d]', 'text-[#6d7fae]', 'cursor-not-allowed');
    btnNext.classList.add('bg-[#3977ff]', 'hover:bg-[#2e68ea]', 'text-white', 'cursor-pointer');
  } else {
    btnNext.disabled = true;
    btnNext.classList.remove('bg-[#3977ff]', 'hover:bg-[#2e68ea]', 'text-white', 'cursor-pointer');
    btnNext.classList.add('bg-[#25396d]', 'text-[#6d7fae]', 'cursor-not-allowed');
  }
});

// Tombol X untuk menyembunyikan bottom banner
btnClose.addEventListener('click', () => {
  banner.style.display = 'none';
});
