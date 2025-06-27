import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';
import { supabase } from '../common/supabase.js';

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
async function getOperacionActual() {
  const id = localStorage.getItem('operacion_actual');
  if (!id) return {};
  
  const { data, error } = await supabase
    .from('operaciones')
    .select('*, checklist_items(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching operacion actual:', error);
    return {};
  }
  return data;
}

async function renderOperacion() {
  const op = await getOperacionActual();
  if (!op.id) {
    // Manejar caso de no encontrar operación
    return;
  }
  document.getElementById('cliente').textContent = op.cliente || '---';
  document.getElementById('ubicacion').textContent = `Depósito: ${op.deposito || '-'}, Área: ${(op.silo || op.celda || '-')}`;
  document.getElementById('fecha').textContent = new Date(op.created_at || Date.now()).toLocaleString('es-AR');
  document.getElementById('mercaderia').textContent = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';

  // Progreso checklist
  const checklist = op.checklist_items || [];
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
document.getElementById('btnEnviar').disabled = false;

}

renderOperacion();
