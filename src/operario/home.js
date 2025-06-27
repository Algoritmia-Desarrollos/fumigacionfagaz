import { renderHeader } from '../common/header.js';
import { requireRole } from '../common/router.js';
import { getOperaciones } from '../common/data.js';
import { supabase } from '../common/supabase.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();

const operacionesList = document.getElementById('operacionesList');
const btnNueva = document.getElementById('btnNueva');

async function renderOperaciones() {
  const ops = (await getOperaciones()).filter(op => op.estado !== 'finalizada' && (!op.tipo_registro || op.tipo_registro === 'inicial'));
  if (ops.length === 0) {
    operacionesList.innerHTML = '<p class="text-[var(--text-secondary)]">No hay operaciones en curso.</p>';
    return;
  }
  
  // Calcular el total de pastillas usadas para cada operación en curso
  // Usar la misma lógica que en finalizar.js: sumar pastillas de todos los registros en curso con mismo cliente, tipo de área y silo/celda
  for (const op of ops) {
    const { data: historial, error } = await supabase
      .from('operaciones')
      .select('pastillas')
      .eq('cliente', op.cliente)
      .eq('area_tipo', op.area_tipo)
      .eq(op.area_tipo === 'silo' ? 'silo' : 'celda', op.area_tipo === 'silo' ? op.silo : op.celda)
      .neq('estado', 'finalizada'); // Excluir operaciones finalizadas para empezar de cero en nuevas operaciones
    
    if (error) {
      console.error(`Error fetching historial de pastillas for operation ${op.id}:`, error);
      // Si hay error, usar solo el valor de pastillas de la operación actual como respaldo
      op.totalPastillas = parseInt(op.pastillas) || 0;
    } else {
      // Sumar todos los valores de pastillas de los registros relacionados en curso
      op.totalPastillas = historial.reduce((sum, reg) => sum + (parseInt(reg.pastillas) || 0), 0);
    }
  }
  operacionesList.innerHTML = ops.map((op) => {
    const areaTipo = op.area_tipo === 'silo' ? 'Silo' : 'Celda';
    const areaValor = op.silo || op.celda || '-';
    const mercaderia = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';
    
    return `
      <div class="bg-white rounded-lg shadow-md p-6 border border-[var(--border-color)] mb-4 hover:shadow-lg transition-shadow">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">person</span>
              <span class="font-semibold">Cliente:</span> <span>${op.cliente || '-'}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">grass</span>
              <span class="font-semibold">Mercadería:</span> <span>${mercaderia}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">location_on</span>
              <span class="font-semibold">Área:</span> <span>${areaTipo}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">store</span>
              <span class="font-semibold">${areaTipo}:</span> <span>${areaValor}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">calendar_today</span>
              <span class="font-semibold">Fecha inicio:</span> <span>${new Date(op.created_at || Date.now()).toLocaleDateString('es-AR')}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="material-icons text-gray-500">local_pharmacy</span>
              <span class="font-semibold">Pastillas usadas:</span> <span>${op.totalPastillas || '0'}</span>
            </div>
          </div>
          <button class="btn-primary rounded-lg px-6 py-3 text-base font-medium hover:bg-blue-700 transition-colors" data-id="${op.id}">Continuar</button>
        </div>
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
