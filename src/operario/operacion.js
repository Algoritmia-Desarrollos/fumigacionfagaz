import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

document.getElementById('btnChecklist').addEventListener('click', () => {
  window.location.href = 'checklist.html';
});

document.getElementById('btnEnviar').addEventListener('click', () => {
  window.location.href = 'finalizar.html';
});

document.getElementById('btnPastillas').addEventListener('click', () => {
  window.location.href = 'pastillas.html';
});

document.getElementById('btnVolver').addEventListener('click', () => {
  window.location.href = 'home.html';
});

// Mostrar datos simulados
function getOperacionActual() {
  const id = localStorage.getItem('operacion_actual');
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  return operaciones.find(op => op.id === id) || {};
}
const op = getOperacionActual();
document.getElementById('cliente').textContent = op.cliente || '---';
document.getElementById('ubicacion').textContent = `Depósito: ${op.deposito || '-'}, Área: ${(op.silo || op.celda || '-')}`;
document.getElementById('fecha').textContent = new Date(op.created_at || Date.now()).toLocaleString('es-AR');
document.getElementById('mercaderia').textContent = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';

// Progreso checklist
const checklist = op.checklist || [];
const completados = checklist.filter(i => i.completado).length;
const pastillasRegistradas = typeof op.pastillas === 'number' && op.pastillas > 0;
document.getElementById('progreso').textContent = `${completados}/4`;
document.getElementById('progressBar').value = completados * 25;
if (completados === 4) {
  document.getElementById('btnPastillas').disabled = false;
  document.getElementById('btnPastillas').style.display = 'block';
} else {
  document.getElementById('btnPastillas').disabled = true;
  document.getElementById('btnPastillas').style.display = 'block';
}
// El botón de finalizar solo se habilita si checklist completo y pastillas registradas
if (completados === 4 && pastillasRegistradas) {
  document.getElementById('btnEnviar').disabled = false;
} else {
  document.getElementById('btnEnviar').disabled = true;
}

function hayOperacionEnCurso() {
  const id = localStorage.getItem('operacion_actual');
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  return operaciones.some(op => op.id === id && op.estado === 'en curso');
}

const modalSinOperacion = document.getElementById('modalSinOperacion');
const btnCerrarModalSinOperacion = document.getElementById('cerrarModalSinOperacion');
if (!hayOperacionEnCurso()) {
  modalSinOperacion.classList.remove('hidden');
  if (btnCerrarModalSinOperacion) {
    btnCerrarModalSinOperacion.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 3500);
}
