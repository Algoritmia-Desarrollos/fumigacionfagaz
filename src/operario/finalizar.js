import { renderHeader } from '../common/header.js';
import { requireRole } from '../common/router.js';
import { supabase } from '../common/supabase.js';

requireRole('operario');

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('header').innerHTML = renderHeader();

  const operacionId = localStorage.getItem('operacion_actual');
  if (!operacionId) {
    alert('No se encontró la operación actual.');
    window.location.href = 'home.html';
    return;
  }

  const { data: op, error: opError } = await supabase
    .from('operaciones')
    .select('*, checklist_items(*)')
    .eq('id', operacionId)
    .single();

  if (opError) {
    alert('Error al obtener la operación.');
    console.error(opError);
    return;
  }

  // Obtener los registros en curso con el mismo cliente, tipo de área y silo/celda para calcular el total de pastillas
  // Usar la misma lógica que en home.js para asegurar consistencia
  const { data: historial, error: historialError } = await supabase
    .from('operaciones')
    .select('pastillas')
    .eq('cliente', op.cliente)
    .eq('area_tipo', op.area_tipo)
    .eq(op.area_tipo === 'silo' ? 'silo' : 'celda', op.area_tipo === 'silo' ? op.silo : op.celda)
    .neq('estado', 'finalizada'); // Excluir operaciones finalizadas

  let totalPastillas = 0;
  if (historialError) {
    alert('Error al obtener los datos de pastillas de la operación.');
    console.error(historialError);
    // Usar el valor de pastillas de la operación actual como respaldo
    totalPastillas = op.pastillas || 0;
  } else {
    totalPastillas = historial.reduce((acc, o) => acc + (o.pastillas || 0), 0);
  }

  // Mostrar datos principales
  const totalPastillasValue = totalPastillas; // Guardar el valor para usarlo después
  document.getElementById('cliente').textContent = op.cliente || '---';
  document.getElementById('mercaderia').textContent = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';
  document.getElementById('area').textContent = op.silo || op.celda || '---';
  document.getElementById('tratamiento').textContent = op.tratamiento || '---';
  document.getElementById('toneladas').textContent = op.toneladas || '0';
  document.getElementById('fechaInicio').textContent = new Date(op.created_at).toLocaleString('es-AR');
  document.getElementById('fechaCierre').textContent = new Date().toLocaleString('es-AR');
  document.getElementById('pastillas').textContent = totalPastillasValue;

  const checklist = op.checklist_items || [];
  const resumen = document.getElementById('checklistResumen');
  if (resumen) {
    resumen.innerHTML = checklist.map(i => `<li>${i.item} <span class='text-green-600'>${i.completado ? '✔' : '✗'}</span></li>`).join('');
  }

  const btnConfirmar = document.getElementById('btnConfirmar');
  if (btnConfirmar) {
    if (op.estado === 'finalizada') {
      btnConfirmar.style.display = 'none';
    } else {
      btnConfirmar.addEventListener('click', async () => {
        if (confirm('¿Está seguro de que desea finalizar esta operación? Esta acción no se puede deshacer.')) {
          // Marcar como finalizadas todas las operaciones en curso con el mismo cliente, tipo de área y silo/celda
        const { error: updateError } = await supabase
          .from('operaciones')
          .update({ estado: 'finalizada' })
          .eq('cliente', op.cliente)
          .eq('area_tipo', op.area_tipo)
          .eq(op.area_tipo === 'silo' ? 'silo' : 'celda', op.area_tipo === 'silo' ? op.silo : op.celda)
          .eq('estado', 'en curso');

        if (updateError) {
          alert('Error al finalizar las operaciones.');
          console.error(updateError);
          return;
        }

        // No eliminar registros de pastillas asociadas, se mantienen como evidencia

        // Crear nuevo registro histórico de finalización
        const nuevoRegistro = {
          cliente: op.cliente,
          area_tipo: op.area_tipo,
          silo: op.silo,
          celda: op.celda,
          mercaderia: op.mercaderia,
          estado: 'finalizada',
          deposito: op.deposito,
          pastillas: op.pastillas,
          tipo_registro: 'finalizacion',
          operario: op.operario,
          tratamiento: op.tratamiento,
          toneladas: op.toneladas,
          operacion_original_id: op.id,
        };

        const { error: insertError } = await supabase.from('operaciones').insert([nuevoRegistro]);

        if (insertError) {
          alert('Error al crear el registro de finalización.');
          console.error(insertError);
          return;
        }

        localStorage.removeItem('operacion_actual');
        alert('Operación finalizada correctamente.');
        window.location.href = 'home.html';
        }
      });
    }
  }
});
