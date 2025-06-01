'use strict';

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

const toggleBackToTopButton = () => {
  const mybutton = document.getElementById('btn-back-to-top');
  mybutton.style.display = window.pageYOffset > 20 ? 'block' : 'none';
};

const typeAnimation = () => {
  const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

  const textArray = [
    'ish haqi daromad soligi uchun kalkulyator!',
    'Siz uchun tezkor hisob-kitoblar!',
    'Internet foydalanuvchilari uchun moliyaviy kalkulyator!',
    'Ochiq manbali loyiha!',
    '2025 yil uchun yangilangan!',
  ];

  const typewriterText = document.getElementById('typewriter-text');
  let textIndex = 0;
  let charIndex = 0;
  let isTyping = true;

  const type = () => {
    if (!isFirefox && charIndex < textArray[textIndex].length) {
      typewriterText.textContent += textArray[textIndex].charAt(charIndex);
      charIndex++;
      setTimeout(type, 60);
    } else {
      isTyping = false;
      setTimeout(erase, 5500);
    }
  };

  const erase = () => {
    if (!isFirefox && isTyping) {
      typewriterText.textContent =
        textArray[textIndex].substring(0, charIndex - 1) + '|';
      isTyping = false;
      setTimeout(erase, 25);
    } else if (!isFirefox) {
      typewriterText.textContent = textArray[textIndex].substring(
        0,
        charIndex - 1
      );
      charIndex--;
      if (charIndex === 0) {
        textIndex = (textIndex + 1) % textArray.length;
        isTyping = true;
        setTimeout(type, 1000);
      } else {
        setTimeout(erase, 50);
      }
    }
  };

  if (!isFirefox) {
    type();
  } else {
    typewriterText.textContent = textArray[0];
  }
};

const submitForm = (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  if (name.trim() === '') {
    alert('Iltimos ismingizni yozing...');
    return;
  }

  if (email.trim() === '' || !isValidEmail(email)) {
    alert('Iltimos email addresingizni yozing...');
    return;
  }

  if (message.trim() === '') {
    alert('Iltimos xabaringizni yozib qoldiring...');
    return;
  }

  document.getElementById('name').value = '';
  document.getElementById('email').value = '';
  document.getElementById('message').value = '';

  alert('Muvaffaqiyatli yuborildi!');
};

const isValidEmail = function (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

document.addEventListener('DOMContentLoaded', () => {
  const mybutton = document.getElementById('btn-back-to-top');
  if (mybutton) {
    mybutton.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', toggleBackToTopButton);
  }

  typeAnimation();

  const submitButton = document.querySelector('form button[type="submit"]');
  if (submitButton) {
    submitButton.addEventListener('click', submitForm);
  }
});
