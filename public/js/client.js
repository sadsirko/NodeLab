const signupForm = document.getElementById('signup-form');
const loginForm = document.getElementById('login-form');

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(signupForm);
  const email = formData.get('username');
  const password = formData.get('password');
})