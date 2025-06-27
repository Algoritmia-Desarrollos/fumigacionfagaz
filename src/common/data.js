export function getOperaciones() {
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  if (operaciones.length === 0) {
    operaciones = [
      { id: '1', operario: 'Juan Perez', cliente: 'Cliente A', deposito: 'Baigorria', area: 'Silo 301', mercaderia: 'Maíz', tratamiento: 'Preventivo', toneladas: 150, pastillas: 300, estado: 'finalizada', created_at: '2024-07-25T10:00:00.000Z', tipo_registro: 'finalizacion', checklist: [{ item: 'Tapar ventiladores', completado: true, imagen: 'https://via.placeholder.com/150' }] },
      { id: '2', operario: 'Ana Gomez', cliente: 'Cliente B', deposito: 'Fagaz', area: 'Celda 2', mercaderia: 'Trigo', tratamiento: 'Curativo', toneladas: 200, pastillas: 600, estado: 'finalizada', created_at: '2024-07-26T11:30:00.000Z', tipo_registro: 'finalizacion', checklist: [{ item: 'Tapar ventiladores', completado: true, imagen: 'https://via.placeholder.com/150' }] },
      { id: '3', operario: 'Juan Perez', cliente: 'Cliente C', deposito: 'Baigorria', area: 'Silo 305', mercaderia: 'Soja', tratamiento: 'Preventivo', toneladas: 180, pastillas: 360, estado: 'en curso', created_at: '2024-07-27T09:00:00.000Z', tipo_registro: 'inicial', checklist: [{ item: 'Tapar ventiladores', completado: false, imagen: 'https://via.placeholder.com/150' }] },
    ];
    localStorage.setItem('operaciones', JSON.stringify(operaciones));
  }
  return operaciones.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export function renderOperaciones(container, operaciones, isAdmin = false) {
  container.innerHTML = '';

  if (window.innerWidth <= 768) {
    // Vista de tarjetas para móviles
    operaciones.forEach(op => {
      const tipoRegistro = op.tipo_registro || 'inicial';
      const tipoText = tipoRegistro === 'pastillas' ? 'Registro Pastillas' : 
                      tipoRegistro === 'finalizacion' ? 'Finalización' : 'Operación Inicial';
      const card = document.createElement('div');
      card.className = 'operacion-card cursor-pointer';
      card.dataset.id = op.id;
      card.innerHTML = `
        <div class="card-item"><span class="item-label">Tipo</span><span class="item-value">${tipoText}</span></div>
        <div class="card-item"><span class="item-label">Cliente</span><span class="item-value">${op.cliente || '-'}</span></div>
        <div class="card-item"><span class="item-label">Mercadería</span><span class="item-value">${op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-'}</span></div>
        <div class="card-item"><span class="item-label">Área</span><span class="item-value">${op.area_tipo === 'silo' ? 'Silo' : 'Celda'}</span></div>
        <div class="card-item"><span class="item-label">${op.area_tipo === 'silo' ? 'Silo' : 'Celda'}</span><span class="item-value">${op.silo || op.celda || '-'}</span></div>
        <div class="card-item"><span class="item-label">Fecha</span><span class="item-value">${new Date(op.created_at || Date.now()).toLocaleDateString('es-AR')}</span></div>
        <div class="card-item"><span class="item-label">Pastillas</span><span class="item-value">${op.pastillas || '-'}</span></div>
        <div class="card-item"><span class="item-label">Estado</span><span class="item-value">${op.estado || 'en curso'}</span></div>
      `;
      container.appendChild(card);
    });
  } else {
    // Vista de tabla para escritorio
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-[var(--border-color)] bg-white rounded-2xl shadow-2xl p-8 border';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tipo</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Cliente</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Mercadería</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Área</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Silo/Celda</th>
          <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Fecha</th>
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
              <td class="px-4 py-2"><span class="px-2 py-1 text-xs font-medium rounded-full ${tipoClass}">${tipoText}</span></td>
              <td class="px-4 py-2">${op.cliente || '-'}</td>
              <td class="px-4 py-2">${op.mercaderia ? op.mercaderia.charAt(0).toUpperCase() + op.mercaderia.slice(1) : '-'}</td>
              <td class="px-4 py-2">${op.area_tipo === 'silo' ? 'Silo' : 'Celda'}</td>
              <td class="px-4 py-2">${op.silo || op.celda || '-'}</td>
              <td class="px-4 py-2">${new Date(op.created_at || Date.now()).toLocaleString('es-AR')}</td>
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
