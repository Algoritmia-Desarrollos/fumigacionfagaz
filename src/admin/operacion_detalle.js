import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('admin');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const resumenContainer = document.getElementById('resumenOperacion');
const form = document.getElementById('formOperacion');
const btnHabilitarEdicion = document.getElementById('btnHabilitarEdicion');
const btnCancelar = document.getElementById('btnCancelar');
const checklistContainer = document.getElementById('checklist-container');

function getOperacionId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function getOperacion(id) {
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  // Simulación de datos de checklist con imágenes
  const operacionesConChecklist = operaciones.map(op => {
    if (!op.checklist) {
      op.checklist = [
        { item: 'Tapar ventiladores', completado: true, imagen: 'https://via.placeholder.com/150' },
        { item: 'Sanitizar', completado: true, imagen: 'https://via.placeholder.com/150' },
        { item: 'Verificar presencia de IV', completado: true, imagen: 'https://via.placeholder.com/150' },
        { item: 'Colocar cartelería', completado: false, imagen: 'https://via.placeholder.com/150' }
      ];
    }
    return op;
  });
  return operacionesConChecklist.find(op => op.id === id);
}

function renderChecklist(checklist) {
  checklistContainer.innerHTML = '';
  if (!checklist || checklist.length === 0) {
    checklistContainer.innerHTML = '<p>No hay datos de checklist para esta operación.</p>';
    return;
  }

  checklist.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'flex items-center justify-between p-3 bg-gray-50 rounded-lg';
    itemDiv.innerHTML = `
      <div class="flex items-center">
        <span class="material-icons mr-3 ${item.completado ? 'text-green-500' : 'text-gray-400'}">
          ${item.completado ? 'check_circle' : 'radio_button_unchecked'}
        </span>
        <span class="font-medium">${item.item}</span>
      </div>
      ${item.imagen ? `<a href="${item.imagen}" target="_blank" class="text-blue-600 hover:underline">Ver Imagen</a>` : ''}
    `;
    checklistContainer.appendChild(itemDiv);
  });
}

function poblarDatos(operacion) {
  if (!operacion) return;

  // Poblar vista de resumen
  document.getElementById('resumen-operario').textContent = operacion.operario || '-';
  document.getElementById('resumen-cliente').textContent = operacion.cliente || '-';
  document.getElementById('resumen-deposito').textContent = operacion.deposito || '-';
  document.getElementById('resumen-area').textContent = operacion.area || '-';
  document.getElementById('resumen-mercaderia').textContent = operacion.mercaderia || '-';
  document.getElementById('resumen-tratamiento').textContent = operacion.tratamiento || '-';
  document.getElementById('resumen-toneladas').textContent = operacion.toneladas || '-';
  document.getElementById('resumen-pastillas').textContent = operacion.pastillas || '-';
  document.getElementById('resumen-estado').textContent = operacion.estado || '-';
  renderChecklist(operacion.checklist);

  // Poblar formulario de edición
  document.getElementById('operario').value = operacion.operario || '';
  document.getElementById('cliente').value = operacion.cliente || '';
  document.getElementById('deposito').value = operacion.deposito || '';
  document.getElementById('area').value = operacion.area || '';
  document.getElementById('mercaderia').value = operacion.mercaderia || '';
  document.getElementById('tratamiento').value = operacion.tratamiento || '';
  document.getElementById('toneladas').value = operacion.toneladas || '';
  document.getElementById('pastillas').value = operacion.pastillas || '';
  document.getElementById('estado').value = operacion.estado || 'en curso';
}

function guardarCambios(e) {
  e.preventDefault();
  const id = getOperacionId();
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  const index = operaciones.findIndex(op => op.id === id);

  if (index !== -1) {
    operaciones[index] = {
      ...operaciones[index],
      operario: document.getElementById('operario').value,
      cliente: document.getElementById('cliente').value,
      deposito: document.getElementById('deposito').value,
      area: document.getElementById('area').value,
      mercaderia: document.getElementById('mercaderia').value,
      tratamiento: document.getElementById('tratamiento').value,
      toneladas: Number(document.getElementById('toneladas').value),
      pastillas: Number(document.getElementById('pastillas').value),
      estado: document.getElementById('estado').value,
    };
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
    alert('Cambios guardados con éxito.');
    
    // Volver a la vista de resumen
    form.classList.add('hidden');
    resumenContainer.classList.remove('hidden');
    btnHabilitarEdicion.classList.remove('hidden');
    poblarDatos(operaciones[index]);
  } else {
    alert('Error: No se encontró la operación.');
  }
}

btnHabilitarEdicion.addEventListener('click', () => {
  resumenContainer.classList.add('hidden');
  form.classList.remove('hidden');
  btnHabilitarEdicion.classList.add('hidden');
});

btnCancelar.addEventListener('click', () => {
  form.classList.add('hidden');
  resumenContainer.classList.remove('hidden');
  btnHabilitarEdicion.classList.remove('hidden');
});

form.addEventListener('submit', guardarCambios);

// Carga inicial
const operacionId = getOperacionId();
if (operacionId) {
  const operacion = getOperacion(operacionId);
  poblarDatos(operacion);
} else {
  alert('No se ha especificado un ID de operación.');
  window.location.href = 'dashboard.html';
}
