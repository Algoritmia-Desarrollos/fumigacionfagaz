import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('header').innerHTML = renderHeader();
  document.getElementById('footer').innerHTML = renderFooter();

  // Mostrar datos simulados
  function getOperacionActual() {
    const id = localStorage.getItem('operacion_actual');
    const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
    return operaciones.find(op => op.id === id) || {};
  }
  const op = getOperacionActual();
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  // Buscar todos los registros históricos de la misma operación (mismo cliente, área, silo/celda)
  const mismosRegistros = operaciones.filter(o =>
    o.cliente === op.cliente &&
    o.area_tipo === op.area_tipo &&
    ((op.area_tipo === 'silo' && o.silo === op.silo) || (op.area_tipo === 'celda' && o.celda === op.celda))
  );
  const totalPastillas = mismosRegistros.reduce((acc, o) => acc + (typeof o.pastillas === 'number' ? o.pastillas : 0), 0);

  // Mostrar datos principales
  const fechaInicio = new Date(op.created_at || Date.now()).toLocaleString('es-AR');
  const fechaCierre = new Date().toLocaleString('es-AR');
  document.getElementById('cliente').textContent = op.cliente || '---';
  document.getElementById('mercaderia').textContent = op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-';
  document.getElementById('deposito').textContent = op.deposito || '---';
  document.getElementById('area').textContent = op.silo || op.celda || '---';
  document.getElementById('modalidad') && (document.getElementById('modalidad').textContent = op.modalidad || '-');
  document.getElementById('tratamiento') && (document.getElementById('tratamiento').textContent = op.tratamiento || '-');
  document.getElementById('toneladas') && (document.getElementById('toneladas').textContent = op.toneladas || '-');
  document.getElementById('pastillas').textContent = totalPastillas;
  document.getElementById('fechaInicio') && (document.getElementById('fechaInicio').textContent = fechaInicio);
  document.getElementById('fechaCierre') && (document.getElementById('fechaCierre').textContent = fechaCierre);

  const checklist = op.checklist || [];
  const resumen = document.getElementById('checklistResumen');
  if (resumen) {
    resumen.innerHTML = checklist.map(i => `<li>${i.item} <span class='text-green-600'>${i.completado ? '✔' : '✗'}</span></li>`).join('');
  }

  const btnConfirmar = document.getElementById('btnConfirmar');
  if (btnConfirmar) {
    if (op.estado === 'finalizada') {
      btnConfirmar.style.display = 'none';
    } else {
      btnConfirmar.addEventListener('click', () => {
        const id = localStorage.getItem('operacion_actual');
        if (!id) {
          alert('No se encontró la operación actual.');
          return;
        }
        let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
        const opBase = operaciones.find(op => op.id === id);
        if (!opBase) {
          alert('No se encontró la operación actual.');
          return;
        }
        // Marcar como finalizadas todas las operaciones en curso con el mismo cliente, tipo de área y silo/celda
        operaciones = operaciones.map(op => {
          if (
            op.estado === 'en curso' &&
            op.cliente === opBase.cliente &&
            op.area_tipo === opBase.area_tipo &&
            ((op.area_tipo === 'silo' && op.silo === opBase.silo) || (op.area_tipo === 'celda' && op.celda === opBase.celda))
          ) {
            return {
              ...op,
              estado: 'finalizada',
              fecha_cierre: Date.now()
            };
          }
          return op;
        });
        // Crear nuevo registro histórico de finalización
        const nuevoRegistro = {
          ...opBase,
          estado: 'finalizada',
          fecha_cierre: Date.now(),
          created_at: Date.now(),
          id: Date.now().toString() + Math.floor(Math.random()*1000),
          tipo_registro: 'finalizacion' // Identificar que es un registro de finalización
        };
        // Insertar el nuevo registro al principio del array
        operaciones.unshift(nuevoRegistro);
        localStorage.setItem('operaciones', JSON.stringify(operaciones));
        localStorage.removeItem('operacion_actual');
        alert('Operación finalizada correctamente.');
        window.location.href = 'home.html';
      });
    }
  }
});

// Lógica para cálculo automático de pastillas
const modalidad = document.getElementById('modalidad');
const toneladasContainer = document.getElementById('toneladasContainer');
const toneladasInput = document.getElementById('toneladas');
const camionesContainer = document.getElementById('camionesContainer');
const camionesInput = document.getElementById('camiones');
const tratamiento = document.getElementById('tratamiento');
const resultadoPastillas = document.getElementById('resultadoPastillas');

function calcularPastillas() {
  let toneladas = 0;
  if (modalidad.value === 'trasilado') {
    toneladas = Number(toneladasInput.value) || 0;
  } else if (modalidad.value === 'descarga') {
    toneladas = (Number(camionesInput.value) || 0) * 28;
  }
  let pastillas = 0;
  if (tratamiento.value === 'preventivo') {
    pastillas = toneladas * 2;
  } else if (tratamiento.value === 'curativo') {
    pastillas = toneladas * 3;
  }
  resultadoPastillas.textContent = pastillas > 0 ? pastillas : '-';
  return pastillas;
}

modalidad.addEventListener('change', () => {
  if (modalidad.value === 'trasilado') {
    toneladasContainer.classList.remove('hidden');
    camionesContainer.classList.add('hidden');
    toneladasInput.value = '';
    camionesInput.value = '';
  } else if (modalidad.value === 'descarga') {
    camionesContainer.classList.remove('hidden');
    toneladasContainer.classList.add('hidden');
    toneladasInput.value = '';
    camionesInput.value = '';
  } else {
    toneladasContainer.classList.add('hidden');
    camionesContainer.classList.add('hidden');
    toneladasInput.value = '';
    camionesInput.value = '';
  }
  calcularPastillas();
});
toneladasInput.addEventListener('input', calcularPastillas);
camionesInput.addEventListener('input', calcularPastillas);
tratamiento.addEventListener('change', calcularPastillas);
