// Header común para todas las páginas
import { getUser, goTo } from './router.js';

export function renderHeader() {
  const user = getUser();
  
  // Función para obtener la página actual
  function getCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename;
  }
  
  // Función para determinar si un enlace está activo
  function isActiveLink(href) {
    const currentPage = getCurrentPage();
    return href === currentPage;
  }
  
  // Función para generar clases CSS según si está activo
  function getLinkClasses(href) {
    const isActive = isActiveLink(href);
    const baseClasses = "text-sm font-medium transition-colors";
    const activeClasses = "text-green-600 font-bold";
    const inactiveClasses = "text-[var(--text-primary)] hover:text-[var(--primary-color)]";
    
    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  }
  
  let navLinks = '';
  if (user?.role === 'admin') {
    navLinks = `
        <a class="${getLinkClasses('dashboard.html')}" href="dashboard.html">Dashboard</a>
        <a class="${getLinkClasses('stock.html')}" href="stock.html">Stock</a>
        <a class="${getLinkClasses('reportes.html')}" href="reportes.html">Reportes</a>
    `;
  } else if (user?.role === 'operario') {
    navLinks = `
        <a class="${getLinkClasses('home.html')}" href="home.html">Operaciones en curso</a>
        <a class="${getLinkClasses('index.html')}" href="index.html">Registrar operación nueva</a>
        <a class="${getLinkClasses('registro.html')}" href="registro.html">Registro de operaciones</a>
    `;
  }
  
  // Navbar con menú hamburguesa
  return `
    <header class="flex items-center justify-between border-b border-[var(--border-color)] px-6 md:px-10 py-4 bg-white shadow-sm relative">
      <div class="flex items-center gap-3">
        <div class="size-8 text-[var(--primary-color)]">
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fill="currentColor" fill-rule="evenodd"></path></svg>
        </div>
        <h1 class="text-xl font-bold">Fagaz Servicios</h1>
      </div>
      <nav class="hidden md:flex items-center gap-6" id="mainNav">
        ${navLinks}
      </nav>
      <div class="flex items-center gap-4">
        <button id="btnLogout" class="hidden md:flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-800">
          <span class="material-icons">logout</span>
          <span>Cerrar Sesión</span>
        </button>
        <button id="hamburgerBtn" class="md:hidden flex flex-col justify-center items-center w-10 h-10" aria-label="Abrir menú">
        <span class="block w-7 h-1 bg-[var(--primary-color)] rounded mb-1"></span>
        <span class="block w-7 h-1 bg-[var(--primary-color)] rounded mb-1"></span>
        <span class="block w-7 h-1 bg-[var(--primary-color)] rounded"></span>
      </button>
      <div id="mobileMenu" class="fixed inset-0 bg-black bg-opacity-40 z-50 flex md:hidden hidden">
        <div class="bg-white w-4/5 max-w-xs h-full shadow-xl p-8 flex flex-col gap-8 animate-slideInLeft justify-between">
          <div class="w-full flex flex-col">
            <button id="closeMobileMenu" class="self-end mb-6" aria-label="Cerrar menú">
              <span class="material-icons text-3xl text-[var(--primary-color)]">close</span>
            </button>
            <nav class="flex flex-col gap-6 text-xl font-semibold w-full">
              ${navLinks}
            </nav>
          </div>
          <button id="logoutMobile" class="btn-logout-mobile rounded-lg px-4 py-3 font-bold flex items-center justify-center text-lg w-full">
            <span class="material-icons mr-2">logout</span>
            Cerrar sesión
          </button>
        </div>
        <div class="flex-1" id="mobileMenuOverlay"></div>
      </div>
      <style>
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slideInLeft { animation: slideInLeft 0.2s; }
        #mobileMenu nav a {
          padding: 0.75rem 0;
          border-radius: 0.5rem;
          transition: background 0.15s, color 0.15s;
          width: 100%;
          text-align: left;
        }
        #mobileMenu nav a.text-green-600 {
          color: #22c55e !important;
          font-weight: bold;
          /* background: #e6f9ed; */
        }
        .btn-logout-mobile {
          background: #f8d7da;
          color: #b71c1c;
          border: none;
          transition: background 0.2s;
        }
        .btn-logout-mobile:hover {
          background: #f1b0b7;
        }
      </style>
    </header>
  `;
}

// Delegación de eventos para el logout
document.addEventListener('click', (e) => {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/src/login/login.html';
  };

  if (e.target.matches('#btnLogout') || e.target.closest('#btnLogout')) {
    handleLogout();
  }
  if (e.target.matches('#logoutMobile') || e.target.closest('#logoutMobile')) {
    handleLogout();
  }
});
