document.addEventListener('DOMContentLoaded', () => {
  const arrow = document.querySelector('.arrow');
  const aboutMeSection = document.querySelector('.introduction');

  arrow.addEventListener('click', () => {
    aboutMeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});