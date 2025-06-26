import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const operacionesList = document.getElementById('operacionesList');
const btnNueva = document.getElementById('btnNueva');

function getOperaciones() {
  return JSON.parse(localStorage.getItem('operaciones')) || [];
}

function setOperaciones(ops) {
  localStorage.setItem('operaciones', JSON.stringify(ops));
}

function renderOperaciones() {
  const ops = getOperaciones().filter(op => op.estado !== 'finalizada' && (!op.tipo_registro || op.tipo_registro === 'inicial'));
  if (ops.length === 0) {
    operacionesList.innerHTML = '<p class="text-[var(--text-secondary)]">No hay operaciones en curso.</p>';
    return;
  }
  operacionesList.innerHTML = ops.map((op, idx) => {
    let areaTipo = op.area_tipo === 'silo' ? 'Silo' : (op.area_tipo === 'celda' ? 'Celda' : '-');
    let areaValor = op.silo || op.celda || '-';
    let mercaderia = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';
    return `
      <div class="border border-[var(--border-color)] rounded-lg px-6 py-5 flex flex-row items-center justify-between gap-4 bg-[var(--background-color)] text-sm">
        <div class="flex flex-row flex-wrap items-center gap-4">
          <span class="font-bold">${op.cliente || '-'}</span>
          <span class="mx-1 text-[var(--border-color)]">|</span>
          <span class="text-[var(--text-secondary)] font-medium">Mercadería:</span> <span class="font-bold">${mercaderia}</span>
          <span class="mx-1 text-[var(--border-color)]">|</span>
          <span class="text-[var(--text-secondary)] font-medium">Tipo de área:</span> <span class="font-bold">${areaTipo}</span>
          <span class="mx-1 text-[var(--border-color)]">|</span>
          <span class="text-[var(--text-secondary)] font-medium">${areaTipo}:</span> <span class="font-bold">${areaValor}</span>
          <span class="mx-1 text-[var(--border-color)]">|</span>
          <span class="text-xs text-[var(--text-secondary)]">Estado: <span class="font-bold">${op.estado}</span></span>
        </div>
        <button class="btn-secondary rounded px-5 py-3 text-base font-medium" data-idx="${op.id}">Continuar</button>
      </div>
    `;
  }).join('');
  // Asignar eventos a los botones
  Array.from(operacionesList.querySelectorAll('button[data-idx]')).forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-idx');
      localStorage.setItem('operacion_actual', id);
      window.location.href = 'operacion.html';
    };
  });
}

btnNueva.onclick = () => {
  localStorage.removeItem('operacion');
  localStorage.removeItem('operacion_actual');
  window.location.href = 'index.html';
};

renderOperaciones();
