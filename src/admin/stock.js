import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('admin');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const stockList = document.getElementById('stock-list');
const historialStockEl = document.getElementById('historial-stock');
const formAñadirStock = document.getElementById('formAñadirStock');
const formQuitarStock = document.getElementById('formQuitarStock');

function getStock() {
  let stock = JSON.parse(localStorage.getItem('stock'));
  if (!stock) {
    stock = {
      'Baigorria': 10000,
      'Fagaz': 15000,
    };
    localStorage.setItem('stock', JSON.stringify(stock));
  }
  return stock;
}

function getHistorialStock() {
  return JSON.parse(localStorage.getItem('historial_stock')) || [];
}

function setHistorialStock(historial) {
  localStorage.setItem('historial_stock', JSON.stringify(historial));
}

function renderStock() {
  const stock = getStock();
  if (stockList) {
    stockList.innerHTML = '';
    for (const deposito in stock) {
      const div = document.createElement('div');
      div.className = 'flex justify-between items-center';
      div.innerHTML = `
        <span class="font-medium">${deposito}</span>
        <span class="font-bold text-lg">${stock[deposito].toLocaleString()} pastillas</span>
      `;
      stockList.appendChild(div);
    }
  }
}

function renderHistorialStock() {
  if (!historialStockEl) return;

  const historial = getHistorialStock().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (historial.length === 0) {
    historialStockEl.innerHTML = '<p class="text-center text-[var(--text-secondary)]">No hay registros de movimientos de stock.</p>';
    return;
  }

  const table = document.createElement('table');
  table.className = 'min-w-full divide-y divide-[var(--border-color)] bg-white';
  
  const thead = `
    <thead>
      <tr>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Fecha</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Tipo</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Depósito</th>
        <th class="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-text-color)] uppercase">Cantidad</th>
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${historial.map(item => {
        const tipo = item.tipo === 'adicion' ? 'Adición' : 'Extracción';
        const tipoClass = item.tipo === 'adicion' ? 'text-green-600' : 'text-red-600';
        return `
          <tr class="hover:bg-[var(--border-color)]">
            <td class="px-4 py-2">${new Date(item.created_at).toLocaleString('es-AR')}</td>
            <td class="px-4 py-2"><span class="font-bold ${tipoClass}">${tipo}</span></td>
            <td class="px-4 py-2">${item.deposito}</td>
            <td class="px-4 py-2">${item.cantidad.toLocaleString()}</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;

  table.innerHTML = thead + tbody;
  historialStockEl.innerHTML = '';
  historialStockEl.appendChild(table);
}

if (formAñadirStock) {
  formAñadirStock.addEventListener('submit', (e) => {
    e.preventDefault();
    const deposito = document.getElementById('deposito').value;
    const cantidad = parseInt(document.getElementById('cantidad').value, 10);

    if (deposito && cantidad > 0) {
      let stock = getStock();
      stock[deposito] = (stock[deposito] || 0) + cantidad;
      localStorage.setItem('stock', JSON.stringify(stock));

      const historial = getHistorialStock();
      historial.push({
        id: Date.now().toString(),
        tipo: 'adicion',
        deposito: deposito,
        cantidad: cantidad,
        created_at: new Date().toISOString(),
      });
      setHistorialStock(historial);

      renderStock();
      renderHistorialStock();
      formAñadirStock.reset();
      alert(`${cantidad} pastillas añadidas al stock de ${deposito}.`);
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  });
}

if (formQuitarStock) {
  formQuitarStock.addEventListener('submit', (e) => {
    e.preventDefault();
    const deposito = document.getElementById('depositoQuitar').value;
    const cantidad = parseInt(document.getElementById('cantidadQuitar').value, 10);

    if (deposito && cantidad > 0) {
      let stock = getStock();
      if (stock[deposito] < cantidad) {
        alert('No hay suficiente stock para quitar esa cantidad.');
        return;
      }
      stock[deposito] -= cantidad;
      localStorage.setItem('stock', JSON.stringify(stock));

      const historial = getHistorialStock();
      historial.push({
        id: Date.now().toString(),
        tipo: 'extraccion',
        deposito: deposito,
        cantidad: cantidad,
        created_at: new Date().toISOString(),
      });
      setHistorialStock(historial);

      renderStock();
      renderHistorialStock();
      formQuitarStock.reset();
      alert(`${cantidad} pastillas quitadas del stock de ${deposito}.`);
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  });
}

// Carga inicial
renderStock();
renderHistorialStock();
