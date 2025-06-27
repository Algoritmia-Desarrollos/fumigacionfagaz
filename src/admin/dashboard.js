import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';
import { getOperaciones, renderOperaciones as renderOperacionesComun } from '../common/data.js';

requireRole('admin');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const toggleFiltrosBtn = document.getElementById('toggleFiltrosBtn');
const filtrosContainer = document.getElementById('filtrosContainer');
const operacionesContainer = document.getElementById('operacionesContainer');

if (toggleFiltrosBtn && filtrosContainer) {
  toggleFiltrosBtn.addEventListener('click', () => {
    filtrosContainer.classList.toggle('hidden');
  });
}

async function aplicarFiltros() {
  let operaciones = await getOperaciones();
  const cliente = document.getElementById('filtroCliente')?.value;
  const mercaderia = document.getElementById('filtroMercaderia')?.value;
  const estado = document.getElementById('filtroEstado')?.value;
  const tipo = document.getElementById('filtroTipo')?.value;
  const fechaDesde = document.getElementById('filtroFechaDesde')?.value;
  const fechaHasta = document.getElementById('filtroFechaHasta')?.value;
  const deposito = document.getElementById('filtroDeposito')?.value;
  const modalidad = document.getElementById('filtroModalidad')?.value;

  if (cliente) {
    operaciones = operaciones.filter(op => op.cliente.toLowerCase().includes(cliente.toLowerCase()));
  }
  if (mercaderia) {
    operaciones = operaciones.filter(op => op.mercaderia === mercaderia);
  }
  if (estado) {
    operaciones = operaciones.filter(op => op.estado === estado);
  }
  if (tipo) {
    operaciones = operaciones.filter(op => (op.tipo_registro || 'inicial') === tipo);
  }
  if (fechaDesde) {
    operaciones = operaciones.filter(op => new Date(op.created_at) >= new Date(fechaDesde));
  }
  if (fechaHasta) {
    operaciones = operaciones.filter(op => new Date(op.created_at) <= new Date(fechaHasta));
  }
  if (deposito) {
    operaciones = operaciones.filter(op => op.deposito === deposito);
  }
  if (modalidad) {
    operaciones = operaciones.filter(op => op.modalidad === modalidad);
  }
  
  renderOperacionesComun(operacionesContainer, operaciones, true);
}

// Añadir event listeners a los filtros
const filtros = document.getElementById('filtrosRegistro');
if (filtros) {
  Array.from(filtros.elements).forEach(el => {
    el.addEventListener('change', aplicarFiltros);
    el.addEventListener('input', aplicarFiltros);
  });
}

const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');
if (btnLimpiarFiltros) {
  btnLimpiarFiltros.addEventListener('click', () => {
    if (filtros) {
      Array.from(filtros.elements).forEach(el => {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
          el.value = '';
        }
      });
    }
    aplicarFiltros();
  });
}

// Render inicial y al cambiar tamaño de ventana
aplicarFiltros();
window.addEventListener('resize', aplicarFiltros);
