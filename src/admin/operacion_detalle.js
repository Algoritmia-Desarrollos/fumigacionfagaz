import { renderHeader } from '../common/header.js';
import { requireRole } from '../common/router.js';
import { supabase } from '../common/supabase.js';

requireRole('admin');
document.getElementById('header').innerHTML = renderHeader();

const btnVolver = document.getElementById('btnVolver');
const btnHabilitarEdicion = document.getElementById('btnHabilitarEdicion');
const btnCancelar = document.getElementById('btnCancelar');
const resumenOperacion = document.getElementById('resumenOperacion');
const formOperacion = document.getElementById('formOperacion');
const checklistContainer = document.getElementById('checklist-container');

const urlParams = new URLSearchParams(window.location.search);
const operacionId = urlParams.get('id');

let operacionActual = {};

async function cargarOperacion() {
  if (!operacionId) {
    alert('ID de operación no encontrado.');
    window.location.href = 'dashboard.html';
    return;
  }

  const { data, error } = await supabase
    .from('operaciones')
    .select('*')
    .eq('id', operacionId)
    .single();

  if (error) {
    console.error('Error cargando la operación:', error);
    alert('No se pudo cargar la operación.');
    return;
  }
  operacionActual = data;

  const idChecklist = operacionActual.operacion_original_id || operacionActual.id;
  const { data: checklistData, error: checklistError } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('operacion_id', idChecklist);

  if (checklistError) {
    console.error('Error cargando el checklist:', checklistError);
  } else {
    operacionActual.checklist_items = checklistData;
  }

  await renderResumen();
  renderFormulario();
}

async function renderResumen() {
  document.getElementById('resumen-cliente').textContent = operacionActual.cliente || 'N/A';
  document.getElementById('resumen-area').textContent = operacionActual.silo || operacionActual.celda || 'N/A';
  document.getElementById('resumen-mercaderia').textContent = operacionActual.mercaderia || 'N/A';
  document.getElementById('resumen-tratamiento').textContent = operacionActual.tratamiento || 'N/A';
  document.getElementById('resumen-toneladas').textContent = operacionActual.toneladas || 'N/A';
  
  // Calcular el total de pastillas usadas hasta la finalización de esta operación
  let totalPastillas = 0;
  if (operacionActual.estado === 'finalizada') {
    const operacionIdReferencia = operacionActual.operacion_original_id || operacionActual.id;
    const { data: registrosPastillas, error } = await supabase
      .from('operaciones')
      .select('pastillas, created_at')
      .eq('operacion_original_id', operacionIdReferencia)
      .eq('tipo_registro', 'pastillas')
      .lte('created_at', operacionActual.updated_at || operacionActual.created_at);

    if (error) {
      console.error('Error cargando registros de pastillas:', error);
      totalPastillas = operacionActual.pastillas || 0;
    } else {
      totalPastillas = registrosPastillas.reduce((sum, registro) => sum + (registro.pastillas || 0), 0);
    }
  } else {
    totalPastillas = operacionActual.pastillas || 0;
  }
  document.getElementById('resumen-pastillas').textContent = totalPastillas || 'N/A';
  
  document.getElementById('resumen-estado').textContent = operacionActual.estado || 'N/A';
  document.getElementById('resumen-fechaInicio').textContent = operacionActual.created_at ? new Date(operacionActual.created_at).toLocaleString('es-AR') : 'N/A';
  document.getElementById('resumen-fechaCierre').textContent = operacionActual.estado === 'finalizada' && operacionActual.updated_at ? new Date(operacionActual.updated_at).toLocaleString('es-AR') : 'Pendiente';

  const checklistHtml = (operacionActual.checklist_items || []).map(item => `
    <div class="flex justify-between items-center p-3 border-b">
      <div>
        <span class="font-medium">${item.item}</span>
        <span class="ml-2 text-sm ${item.completado ? 'text-green-600' : 'text-red-600'}">
          ${item.completado ? 'Completado' : 'Pendiente'}
        </span>
      </div>
      ${item.imagen_url ? `
        <a href="${item.imagen_url}" target="_blank" class="flex items-center gap-2 text-blue-600 hover:underline">
          <span class="material-icons">image</span>
          <span>Ver Evidencia</span>
        </a>
      ` : '<span class="text-gray-400">Sin Evidencia</span>'}
    </div>
  `).join('');
  
  checklistContainer.innerHTML = checklistHtml || '<p class="text-gray-500">No hay ítems en el checklist para esta operación.</p>';
}

function renderFormulario() {
  document.getElementById('operario').value = operacionActual.operario || '';
  document.getElementById('cliente').value = operacionActual.cliente || '';
  document.getElementById('deposito').value = operacionActual.deposito || '';
  document.getElementById('area').value = operacionActual.silo || operacionActual.celda || '';
  document.getElementById('mercaderia').value = operacionActual.mercaderia || '';
  document.getElementById('tratamiento').value = operacionActual.tratamiento || '';
  document.getElementById('toneladas').value = operacionActual.toneladas || '';
  document.getElementById('pastillas').value = operacionActual.pastillas || '';
  document.getElementById('estado').value = operacionActual.estado || '';
}

btnHabilitarEdicion.addEventListener('click', () => {
  resumenOperacion.classList.add('hidden');
  formOperacion.classList.remove('hidden');
});

btnCancelar.addEventListener('click', () => {
  formOperacion.classList.add('hidden');
  resumenOperacion.classList.remove('hidden');
});

btnVolver.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

btnEliminar.addEventListener('click', async () => {
  if (confirm('¿Está seguro de que desea eliminar esta operación? Esta acción no se puede deshacer.')) {
    const { error } = await supabase
      .from('operaciones')
      .delete()
      .eq('id', operacionId);

    if (error) {
      console.error('Error eliminando la operación:', error);
      alert('No se pudo eliminar la operación.');
    } else {
      alert('Operación eliminada correctamente.');
      window.location.href = 'dashboard.html';
    }
  }
});

formOperacion.addEventListener('submit', async (e) => {
  e.preventDefault();
  const updates = {
    operario: document.getElementById('operario').value,
    cliente: document.getElementById('cliente').value,
    deposito: document.getElementById('deposito').value,
    // Asumiendo que el área no se puede cambiar de silo a celda y viceversa
    [operacionActual.area_tipo === 'silo' ? 'silo' : 'celda']: document.getElementById('area').value,
    mercaderia: document.getElementById('mercaderia').value,
    tratamiento: document.getElementById('tratamiento').value,
    toneladas: parseInt(document.getElementById('toneladas').value, 10),
    pastillas: parseInt(document.getElementById('pastillas').value, 10),
    estado: document.getElementById('estado').value,
  };

  const { error } = await supabase
    .from('operaciones')
    .update(updates)
    .eq('id', operacionId);

  if (error) {
    console.error('Error actualizando la operación:', error);
    alert('No se pudo actualizar la operación.');
  } else {
    alert('Operación actualizada correctamente.');
    await cargarOperacion();
    formOperacion.classList.add('hidden');
    resumenOperacion.classList.remove('hidden');
  }
});

cargarOperacion();
