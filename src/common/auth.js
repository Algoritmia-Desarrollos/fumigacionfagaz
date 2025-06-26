// Módulo de autenticación (stub)

const dummyUsers = [
  { email: 'admin@fagaz.com', password: 'admin', role: 'admin', name: 'Administrador' },
  { email: 'operario@fagaz.com', password: 'operario', role: 'operario', name: 'Operario Juan' }
];

export function login(email, password) {
  return new Promise((resolve, reject) => {
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      resolve(user);
    } else {
      reject('Credenciales incorrectas');
    }
  });
}

export function logout() {
  localStorage.removeItem('user');
  window.location.href = '../login/login.html';
}
