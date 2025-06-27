import { supabase } from './supabase.js';

export async function getOperaciones() {
  const { data, error } = await supabase
    .from('operaciones')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching operaciones:', error);
    return [];
  }
  return data;
}

export function renderOperaciones(container, operaciones, isAdmin = false) {
  container.innerHTML = '';

  if (window.innerWidth <= 768) {
    // Vista de tabla desplazable horizontalmente para móviles
    const table = document.createElement('div');
    table.className = 'overflow-x-auto';
    table.innerHTML = `
      <table class="min-w-full divide-y divide-[var(--border-color)] bg-white rounded-2xl shadow-md border">
        <thead>
          <tr>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Fecha/Hora</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tipo</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Cliente</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Mercadería</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Área</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Silo/Celda</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Depósito</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Pastillas</th>
            <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Estado</th>
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
              <tr class="hover:bg-[var(--border-color)] cursor-pointer border-t" data-id="${op.id}">
                <td class="px-3 py-2 text-xs">${new Date(op.created_at || Date.now()).toLocaleString('es-AR')}</td>
                <td class="px-3 py-2"><span class="px-2 py-1 text-xs font-medium rounded-full ${tipoClass}">${tipoText}</span></td>
                <td class="px-3 py-2 text-xs">${op.cliente || '-'}</td>
                <td class="px-3 py-2 text-xs">${op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-'}</td>
                <td class="px-3 py-2 text-xs">${op.area_tipo === 'silo' ? 'Silo' : 'Celda'}</td>
                <td class="px-3 py-2 text-xs">${op.silo || op.celda || '-'}</td>
                <td class="px-3 py-2 text-xs">${op.deposito || '-'}</td>
                <td class="px-3 py-2 text-xs">${op.pastillas || '-'}</td>
                <td class="px-3 py-2 text-xs">${op.estado || 'en curso'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    container.appendChild(table);
  } else {
    // Vista de tabla para escritorio
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-[var(--border-color)] bg-white rounded-2xl shadow-2xl p-8 border';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Fecha/Hora</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tipo</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Cliente</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Mercadería</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Área</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Silo/Celda</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Depósito</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Pastillas</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Estado</th>
          ${isAdmin ? '<th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Acciones</th>' : ''}
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
            <tr class="hover:bg-[var(--border-color)] cursor-pointer" data-id="${op.id}">
              <td class="px-4 py-2">${new Date(op.created_at || Date.now()).toLocaleString('es-AR')}</td>
              <td class="px-4 py-2"><span class="px-2 py-1 text-xs font-medium rounded-full ${tipoClass}">${tipoText}</span></td>
              <td class="px-4 py-2">${op.cliente || '-'}</td>
              <td class="px-4 py-2">${op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-'}</td>
              <td class="px-4 py-2">${op.area_tipo === 'silo' ? 'Silo' : 'Celda'}</td>
              <td class="px-4 py-2">${op.silo || op.celda || '-'}</td>
              <td class="px-4 py-2">${op.deposito || '-'}</td>
              <td class="px-4 py-2">${op.pastillas || '-'}</td>
              <td class="px-4 py-2">${op.estado || 'en curso'}</td>
              ${isAdmin ? `<td class="px-4 py-2"><a href="operacion_detalle.html?id=${op.id}" class="font-medium text-blue-600 hover:underline">Ver Detalles</a></td>` : ''}
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
    container.appendChild(table);
  }

  // Hacer filas/tarjetas clickeables solo para admin
  if (isAdmin) {
    Array.from(container.querySelectorAll('[data-id]')).forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const url = `operacion_detalle.html?id=${id}`;
        window.location.href = url;
      });
    });
  }
}
