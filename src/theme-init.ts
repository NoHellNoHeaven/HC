(function() {
  try {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
  }
})();
