// Contact form -> Google Apps Script -> Google Sheet
// The form posts to a hidden iframe so the page never navigates away,
// and there's no CORS issue because it's a real form submission, not a fetch() call.

(function () {
  const form = document.getElementById('contactForm');
  const iframe = document.getElementById('hidden_iframe');
  const success = document.getElementById('formSuccess');
  let submitted = false;

  if (!form) return;

  form.addEventListener('submit', function (event) {
    // Basic guard: don't let this fire until a real script URL is configured.
    if (form.action.includes('PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE')) {
      event.preventDefault();
      alert('Form is not connected yet — paste your Google Apps Script Web App URL into the form\'s "action" attribute in index.html.');
      return false;
    }
    submitted = true;
  });

  iframe.addEventListener('load', function () {
    if (!submitted) return; // ignore the initial blank load on page load
    form.style.display = 'none';
    success.classList.add('visible');
    submitted = false;
  });
})();
