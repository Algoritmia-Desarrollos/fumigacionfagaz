import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';
import { getOperaciones } from '../common/data.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const operacionesList = document.getElementById('operacionesList');
const btnNueva = document.getElementById('btnNueva');

function renderOperaciones() {
  const ops = getOperaciones().filter(op => op.estado !== 'finalizada' && (!op.tipo_registro || op.tipo_registro === 'inicial'));
  if (ops.length === 0) {
    operacionesList.innerHTML = '<p class="text-[var(--text-secondary)]">No hay operaciones en curso.</p>';
    return;
  }
  operacionesList.innerHTML = ops.map((op) => {
    const areaTipo = op.area_tipo === 'silo' ? 'Silo' : 'Celda';
    const areaValor = op.silo || op.celda || '-';
    const mercaderia = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';
    
    return `
      <div class="border border-[var(--border-color)] rounded-lg px-6 py-5 flex flex-row items-center justify-between gap-4 bg-[var(--background-color)] text-sm">
        <div class="flex flex-row flex-wrap items-center gap-x-4 gap-y-2">
          <div><span class="font-bold">Cliente:</span> ${op.cliente || '-'}</div>
          <div><span class="font-bold">Mercadería:</span> ${mercaderia}</div>
          <div><span class="font-bold">Área:</span> ${areaTipo}</div>
          <div><span class="font-bold">${areaTipo}:</span> ${areaValor}</div>
          <div><span class="font-bold">Fecha:</span> ${new Date(op.created_at || Date.now()).toLocaleDateString('es-AR')}</div>
        </div>
        <button class="btn-primary rounded px-5 py-3 text-base font-medium" data-id="${op.id}">Continuar</button>
      </div>
    `;
  }).join('');

  // Asignar eventos a los botones
  Array.from(operacionesList.querySelectorAll('button[data-id]')).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      localStorage.setItem('operacion_actual', id);
      window.location.href = 'operacion.html';
    });
  });
}

btnNueva.onclick = () => {
  localStorage.removeItem('operacion');
  localStorage.removeItem('operacion_actual');
  window.location.href = 'index.html';
};

renderOperaciones();
