import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

function getOperaciones() {
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  // Si no hay datos, cargar ejemplos
  if (operaciones.length === 0) {
    operaciones = [
      {
        id: 'op1',
        cliente: 'Cliente A',
        deposito: 'Baigorria',
        created_at: Date.now() - 86400000 * 2,
        estado: 'finalizada',
        checklist: [
          { item: 'Tapar ventiladores', completado: true },
          { item: 'Sanitizar', completado: true },
          { item: 'Verificar presencia de IV', completado: true },
          { item: 'Colocar cartelería', completado: true }
        ],
        pastillas: 40
      },
      {
        id: 'op2',
        cliente: 'Cliente B',
        deposito: 'Fagaz',
        created_at: Date.now() - 86400000,
        estado: 'en curso',
        checklist: [
          { item: 'Tapar ventiladores', completado: true },
          { item: 'Sanitizar', completado: false },
          { item: 'Verificar presencia de IV', completado: false },
          { item: 'Colocar cartelería', completado: false }
        ],
        pastillas: null
      },
      {
        id: 'op3',
        cliente: 'Cliente C',
        deposito: 'Baigorria',
        created_at: Date.now() - 3600000,
        estado: 'finalizada',
        checklist: [
          { item: 'Tapar ventiladores', completado: true },
          { item: 'Sanitizar', completado: true },
          { item: 'Verificar presencia de IV', completado: true },
          { item: 'Colocar cartelería', completado: true }
        ],
        pastillas: 32
      }
    ];
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }
  return operaciones;
}

function renderTabla(filtros = {}) {
  let operaciones = getOperaciones();
  // Ordenar SIEMPRE por más recientes primero
  operaciones = operaciones.slice().sort((a, b) => {
    const fechaA = typeof a.created_at === 'string' ? new Date(a.created_at).getTime() : Number(a.created_at);
    const fechaB = typeof b.created_at === 'string' ? new Date(b.created_at).getTime() : Number(b.created_at);
    return fechaB - fechaA;
  });
  // Filtrar por cliente
  if (filtros.cliente) {
    operaciones = operaciones.filter(op => (op.cliente || '').toLowerCase().includes(filtros.cliente.toLowerCase()));
  }
  // Filtrar por mercadería
  if (filtros.mercaderia) {
    operaciones = operaciones.filter(op => (op.mercaderia || '').toLowerCase() === filtros.mercaderia.toLowerCase());
  }
  // Filtrar por depósito
  if (filtros.deposito) {
    operaciones = operaciones.filter(op => (op.deposito || '').toLowerCase() === filtros.deposito.toLowerCase());
  }
  // Filtrar por modalidad
  if (filtros.modalidad) {
    operaciones = operaciones.filter(op => (op.modalidad || '').toLowerCase() === filtros.modalidad.toLowerCase());
  }
  // Filtrar por tratamiento
  if (filtros.tratamiento) {
    operaciones = operaciones.filter(op => (op.tratamiento || '').toLowerCase() === filtros.tratamiento.toLowerCase());
  }
  // Filtrar por fecha desde
  if (filtros.fechaDesde) {
    const desde = new Date(filtros.fechaDesde).setHours(0,0,0,0);
    operaciones = operaciones.filter(op => {
      const fecha = typeof op.created_at === 'string' ? new Date(op.created_at).getTime() : Number(op.created_at);
      return fecha >= desde;
    });
  }
  // Filtrar por fecha hasta
  if (filtros.fechaHasta) {
    const hasta = new Date(filtros.fechaHasta).setHours(23,59,59,999);
    operaciones = operaciones.filter(op => {
      const fecha = typeof op.created_at === 'string' ? new Date(op.created_at).getTime() : Number(op.created_at);
      return fecha <= hasta;
    });
  }
  // Filtrar por estado
  if (filtros.estado) {
    operaciones = operaciones.filter(op => (op.estado || '').toLowerCase() === filtros.estado.toLowerCase());
  }
  // Filtrar por tipo de registro
  if (filtros.tipo) {
    operaciones = operaciones.filter(op => {
      const tipoRegistro = op.tipo_registro || 'inicial';
      return tipoRegistro === filtros.tipo;
    });
  }
  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-[var(--border-color)]';
  table.innerHTML = `
    <thead>
      <tr>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tipo</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Cliente</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Mercadería</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Fecha de Registro</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Depósito</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Modalidad</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tratamiento</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Pastillas Usadas</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Estado</th>
      </tr>
    </thead>
    <tbody>
      ${operaciones.map(op => {
        const tipoRegistro = op.tipo_registro || 'inicial';
        const tipoText = tipoRegistro === 'pastillas' ? 'Registro Pastillas' : 
                        tipoRegistro === 'finalizacion' ? 'Finalización' : 'Operación Inicial';
        const tipoClass = tipoRegistro === 'pastillas' ? 'bg-blue-100 text-blue-800' : 
                         tipoRegistro === 'finalizacion' ? 'bg-red-100 text-red-800' : 
                         'bg-green-100 text-green-800';
        
        return `
          <tr class="hover:bg-[var(--border-color)] cursor-pointer" data-id="${op.id}" data-estado="${op.estado || 'en curso'}">
            <td class="px-4 py-2">
              <span class="px-2 py-1 text-xs font-medium rounded-full ${tipoClass}">${tipoText}</span>
            </td>
            <td class="px-4 py-2">${op.cliente || '-'}</td>
            <td class="px-4 py-2">${op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-'}</td>
            <td class="px-4 py-2">
              <div>${new Date(op.created_at || Date.now()).toLocaleString('es-AR')}</div>
              <div class="text-xs text-[var(--muted-text-color)]">Registro creado el ${new Date(op.created_at || Date.now()).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            </td>
            <td class="px-4 py-2">${op.deposito || '-'}</td>
            <td class="px-4 py-2">${op.modalidad ? op.modalidad.charAt(0).toUpperCase() + op.modalidad.slice(1) : ''}</td>
            <td class="px-4 py-2">${op.tratamiento ? op.tratamiento.charAt(0).toUpperCase() + op.tratamiento.slice(1) : ''}</td>
            <td class="px-4 py-2">${typeof op.pastillas === 'number' ? op.pastillas : ''}</td>
            <td class="px-4 py-2">${op.estado || 'en curso'}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;
  const cont = document.getElementById('operacionesTable');
  cont.innerHTML = '';
  cont.style.maxWidth = 'none';
  cont.style.width = '100%';
  cont.appendChild(table);
  // Hacer filas clickeables
  Array.from(table.querySelectorAll('tbody tr')).forEach(tr => {
    const estado = tr.getAttribute('data-estado');
    tr.addEventListener('click', () => {
      const id = tr.getAttribute('data-id');
      localStorage.setItem('operacion_actual', id);
      if (estado === 'finalizada') {
        window.location.href = 'finalizar.html';
      } else {
        window.location.href = 'operacion.html';
      }
    });
  });
}

// Filtros interactivos
const filtroCliente = document.getElementById('filtroCliente');
const filtroMercaderia = document.getElementById('filtroMercaderia');
const filtroDeposito = document.getElementById('filtroDeposito');
const filtroModalidad = document.getElementById('filtroModalidad');
const filtroTratamiento = document.getElementById('filtroTratamiento');
const filtroFechaDesde = document.getElementById('filtroFechaDesde');
const filtroFechaHasta = document.getElementById('filtroFechaHasta');
const filtroEstado = document.getElementById('filtroEstado');
const filtroTipo = document.getElementById('filtroTipo');
const btnLimpiarFiltros = document.getElementById('btnLimpiarFiltros');

function aplicarFiltros() {
  renderTabla({
    cliente: filtroCliente ? filtroCliente.value : '',
    mercaderia: filtroMercaderia ? filtroMercaderia.value : '',
    deposito: filtroDeposito ? filtroDeposito.value : '',
    modalidad: filtroModalidad ? filtroModalidad.value : '',
    tratamiento: filtroTratamiento ? filtroTratamiento.value : '',
    fechaDesde: filtroFechaDesde ? filtroFechaDesde.value : '',
    fechaHasta: filtroFechaHasta ? filtroFechaHasta.value : '',
    estado: filtroEstado ? filtroEstado.value : '',
    tipo: filtroTipo ? filtroTipo.value : ''
  });
}

if (filtroCliente) filtroCliente.addEventListener('input', aplicarFiltros);
if (filtroMercaderia) filtroMercaderia.addEventListener('change', aplicarFiltros);
if (filtroDeposito) filtroDeposito.addEventListener('change', aplicarFiltros);
if (filtroModalidad) filtroModalidad.addEventListener('change', aplicarFiltros);
if (filtroTratamiento) filtroTratamiento.addEventListener('change', aplicarFiltros);
if (filtroFechaDesde) filtroFechaDesde.addEventListener('change', aplicarFiltros);
if (filtroFechaHasta) filtroFechaHasta.addEventListener('change', aplicarFiltros);
if (filtroEstado) filtroEstado.addEventListener('change', aplicarFiltros);
if (filtroTipo) filtroTipo.addEventListener('change', aplicarFiltros);
if (btnLimpiarFiltros) btnLimpiarFiltros.addEventListener('click', () => {
  if (filtroCliente) filtroCliente.value = '';
  if (filtroMercaderia) filtroMercaderia.value = '';
  if (filtroDeposito) filtroDeposito.value = '';
  if (filtroModalidad) filtroModalidad.value = '';
  if (filtroTratamiento) filtroTratamiento.value = '';
  if (filtroFechaDesde) filtroFechaDesde.value = '';
  if (filtroFechaHasta) filtroFechaHasta.value = '';
  if (filtroEstado) filtroEstado.value = '';
  if (filtroTipo) filtroTipo.value = '';
  aplicarFiltros();
});

renderTabla();
