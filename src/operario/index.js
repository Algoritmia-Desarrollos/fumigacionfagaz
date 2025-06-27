import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

// Mostrar/ocultar selectores de silo/celda
const areaTipoSelect = document.getElementById('area_tipo');
const siloSelectorContainer = document.getElementById('silo_selector_container');
const celdaSelectorContainer = document.getElementById('celda_selector_container');
if (areaTipoSelect && siloSelectorContainer && celdaSelectorContainer) {
  areaTipoSelect.addEventListener('change', function() {
    if (this.value === 'silo') {
      siloSelectorContainer.classList.remove('hidden');
      celdaSelectorContainer.classList.add('hidden');
    } else if (this.value === 'celda') {
      celdaSelectorContainer.classList.remove('hidden');
      siloSelectorContainer.classList.add('hidden');
    } else {
      siloSelectorContainer.classList.add('hidden');
      celdaSelectorContainer.classList.add('hidden');
    }
  });
}

function hayOperacionEnCurso() {
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  return operaciones.some(op => op.estado === 'en curso');
}

const modal = document.getElementById('modalOperacionEnCurso');
const btnCerrarModal = document.getElementById('cerrarModalOperacion');
if (btnCerrarModal) {
  btnCerrarModal.addEventListener('click', () => {
    modal.classList.add('hidden');
  });
}

function operacionDuplicada(cliente, area_tipo, silo, celda) {
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  return operaciones.some(op => {
    if (op.estado !== 'en curso') return false;
    if (op.cliente !== cliente) return false;
    if (op.area_tipo !== area_tipo) return false;
    if (area_tipo === 'silo' && op.silo === silo) return true;
    if (area_tipo === 'celda' && op.celda === celda) return true;
    return false;
  });
}

const form = document.getElementById('nuevaOperacionForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  // Validar duplicidad de operación
  const cliente = form.cliente.value;
  const area_tipo = form.area_tipo.value;
  const silo = form.silo_selector?.value;
  const celda = form.celda_selector?.value;
  if (operacionDuplicada(cliente, area_tipo, silo, celda)) {
    // Mostrar modal de duplicidad
    modal.querySelector('h3').textContent = 'Operación duplicada';
    modal.querySelector('p').textContent = 'Ya existe una operación activa con el mismo cliente, área y silo/celda.';
    modal.classList.remove('hidden');
    return;
  }
  // Guardar datos de la operación en localStorage
  const idOperacion = Date.now().toString();
  const fechaCreacion = new Date().toISOString();

  const operacionInicial = {
    id: idOperacion,
    cliente: form.cliente.value,
    area_tipo: form.area_tipo.value,
    silo: form.silo_selector?.value,
    celda: form.celda_selector?.value,
    mercaderia: form.mercaderia.value,
    estado: 'en curso',
    checklist: [],
    created_at: fechaCreacion,
    // Datos que estarán en blanco en el registro inicial
    deposito: '',
    pastillas: null,
    tipo_registro: 'inicial' // Identificador del tipo de registro
  };

  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  operaciones.push(operacionInicial);
  localStorage.setItem('operaciones', JSON.stringify(operaciones));
  localStorage.setItem('operacion_actual', operacionInicial.id);
  window.location.href = 'operacion.html';
});
