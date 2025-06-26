import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const modalidad = document.getElementById('modalidad');
const toneladasContainer = document.getElementById('toneladasContainer');
const toneladasInput = document.getElementById('toneladas');
const camionesContainer = document.getElementById('camionesContainer');
const camionesInput = document.getElementById('camiones');
const tratamiento = document.getElementById('tratamiento');
const resultadoPastillas = document.getElementById('resultadoPastillas');
const btnConfirmar = document.getElementById('btnConfirmar');
const btnCalcular = document.getElementById('btnCalcular');
const resumenPastillas = document.getElementById('resumenPastillas');
const resumenModalidad = document.getElementById('resumenModalidad');
const resumenToneladas = document.getElementById('resumenToneladas');
const resumenTratamiento = document.getElementById('resumenTratamiento');
const resumenDosis = document.getElementById('resumenDosis');
const resumenTotal = document.getElementById('resumenTotal');
const btnRegistrar = document.getElementById('btnRegistrar');
const deposito = document.getElementById('deposito');
const resumenDeposito = document.getElementById('resumenDeposito');

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

// Inicializar stock si no existe
function inicializarStock() {
  let stock = JSON.parse(localStorage.getItem('stock_pastillas'));
  if (!stock) {
    stock = {
      'Baigorria': 2500,
      'Fagaz': 3800
    };
    localStorage.setItem('stock_pastillas', JSON.stringify(stock));
  }
  return stock;
}

function descontarStock(deposito, cantidad) {
  let stock = JSON.parse(localStorage.getItem('stock_pastillas')) || {};
  if (!stock[deposito]) stock[deposito] = 0;
  if (stock[deposito] < cantidad) return false;
  stock[deposito] -= cantidad;
  localStorage.setItem('stock_pastillas', JSON.stringify(stock));
  return true;
}

inicializarStock();

function getResumenTextos() {
  let modalidadTxt = modalidad.value === 'trasilado' ? 'Trasilado' : (modalidad.value === 'descarga' ? 'Descarga de camiones' : '-');
  let toneladas = 0;
  if (modalidad.value === 'trasilado') toneladas = Number(toneladasInput.value) || 0;
  if (modalidad.value === 'descarga') toneladas = (Number(camionesInput.value) || 0) * 28;
  let tratamientoTxt = tratamiento.value === 'preventivo' ? 'Preventivo' : (tratamiento.value === 'curativo' ? 'Curativo' : '-');
  let dosis = tratamiento.value === 'preventivo' ? '2 pastillas/tn' : (tratamiento.value === 'curativo' ? '3 pastillas/tn' : '-');
  let pastillas = calcularPastillas();
  return { modalidadTxt, toneladas, tratamientoTxt, dosis, pastillas };
}

function setInputsFromOperacion() {
  const id = localStorage.getItem('operacion_actual');
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  const opActual = operaciones.find(op => op.id === id);
  if (!opActual) return;
  if (opActual.deposito) {
    deposito.value = opActual.deposito;
  }
  if (opActual.modalidad) {
    modalidad.value = opActual.modalidad;
    if (opActual.modalidad === 'trasilado') {
      toneladasContainer.classList.remove('hidden');
      camionesContainer.classList.add('hidden');
      toneladasInput.value = opActual.toneladas || '';
      camionesInput.value = '';
    } else if (opActual.modalidad === 'descarga') {
      camionesContainer.classList.remove('hidden');
      toneladasContainer.classList.add('hidden');
      camionesInput.value = opActual.camiones || '';
      toneladasInput.value = '';
    }
  }
  if (opActual.tratamiento) {
    tratamiento.value = opActual.tratamiento;
  }
}

function mostrarResumenAuto() {
  const { modalidadTxt, toneladas, tratamientoTxt, dosis, pastillas } = getResumenTextos();
  resumenDeposito.textContent = deposito.value || '-';
  resumenModalidad.textContent = modalidadTxt;
  resumenToneladas.textContent = toneladas || '-';
  resumenTratamiento.textContent = tratamientoTxt;
  resumenDosis.textContent = dosis;
  resumenTotal.textContent = pastillas > 0 ? pastillas : '-';
}

document.addEventListener('DOMContentLoaded', () => {
  setInputsFromOperacion();
  mostrarResumenAuto();
});

deposito.addEventListener('change', mostrarResumenAuto);
modalidad.addEventListener('change', mostrarResumenAuto);
toneladasInput.addEventListener('input', mostrarResumenAuto);
camionesInput.addEventListener('input', mostrarResumenAuto);
tratamiento.addEventListener('change', mostrarResumenAuto);

btnRegistrar.addEventListener('click', () => {
  const { pastillas } = getResumenTextos();
  if (!deposito.value || !modalidad.value || !tratamiento.value || pastillas <= 0) {
    alert('Complete todos los campos y asegúrese de que la cantidad de pastillas sea válida.');
    return;
  }
  // Obtener depósito seleccionado
  const depositoSeleccionado = deposito.value;
  // Descontar stock
  if (!descontarStock(depositoSeleccionado, pastillas)) {
    alert('No hay suficiente stock de pastillas en el depósito ' + depositoSeleccionado + '.');
    return;
  }
  // Guardar SIEMPRE como nuevo registro independiente
  const id = localStorage.getItem('operacion_actual');
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  const opBase = operaciones.find(op => op.id === id);
  if (!opBase) {
    alert('No se encontró la operación base.');
    return;
  }
  const nuevoRegistro = {
    ...opBase,
    deposito: depositoSeleccionado,
    modalidad: modalidad.value,
    tratamiento: tratamiento.value,
    toneladas: modalidad.value === 'trasilado' ? Number(toneladasInput.value) : (Number(camionesInput.value) * 28),
    camiones: modalidad.value === 'descarga' ? Number(camionesInput.value) : undefined,
    pastillas,
    created_at: Date.now(),
    id: Date.now().toString() + Math.floor(Math.random()*1000),
    estado: opBase.estado // mantiene el estado actual (en curso o finalizada)
  };
  // Insertar el nuevo registro al principio del array para que sea el más reciente
  operaciones.unshift(nuevoRegistro);
  localStorage.setItem('operaciones', JSON.stringify(operaciones));
  alert('Registro de pastillas guardado y stock descontado correctamente.');
  window.location.href = 'operacion.html';
}); 