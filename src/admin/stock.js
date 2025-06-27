import { renderHeader } from '../common/header.js';
import { requireRole } from '../common/router.js';
import { supabase } from '../common/supabase.js';

requireRole('admin');
document.getElementById('header').innerHTML = renderHeader();

const stockList = document.getElementById('stock-list');
const historialStockEl = document.getElementById('historial-stock');
const formAñadirStock = document.getElementById('formAñadirStock');
const formQuitarStock = document.getElementById('formQuitarStock');

async function getStock() {
  const { data, error } = await supabase.from('stock').select('*');
  if (error) {
    console.error('Error fetching stock:', error);
    return {};
  }
  return data.reduce((acc, item) => {
    acc[item.deposito] = item.cantidad;
    return acc;
  }, {});
}

async function getHistorialStock() {
  const { data, error } = await supabase.from('historial_stock').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching stock history:', error);
    return [];
  }
  return data;
}

async function renderStock() {
  const stock = await getStock();
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

async function renderHistorialStock() {
  if (!historialStockEl) return;

  const historial = await getHistorialStock();

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
        let tipo, tipoClass;
        switch (item.tipo) {
          case 'adicion':
            tipo = 'Adición';
            tipoClass = 'text-green-600';
            break;
          case 'extraccion':
            tipo = 'Extracción';
            tipoClass = 'text-yellow-600';
            break;
          case 'uso':
            tipo = 'Uso';
            tipoClass = 'text-red-600';
            break;
        }
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
  formAñadirStock.addEventListener('submit', async (e) => {
    e.preventDefault();
    const deposito = document.getElementById('deposito').value;
    const cantidad = parseInt(document.getElementById('cantidad').value, 10);

    if (deposito && cantidad > 0) {
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('id, cantidad')
        .eq('deposito', deposito)
        .single();

      if (stockError && stockError.code !== 'PGRST116') { // Ignorar error si no se encuentra la fila
        console.error('Error fetching stock:', stockError);
        alert('Error al obtener el stock.');
        return;
      }

      const nuevaCantidad = (stockData?.cantidad || 0) + cantidad;
      
      const { error: upsertError } = await supabase
        .from('stock')
        .upsert({ id: stockData?.id, deposito, cantidad: nuevaCantidad }, { onConflict: 'deposito' });

      if (upsertError) {
        console.error('Error upserting stock:', upsertError);
        alert('Error al actualizar el stock.');
        return;
      }

      const { error: historyError } = await supabase
        .from('historial_stock')
        .insert([{ tipo: 'adicion', deposito, cantidad }]);

      if (historyError) {
        console.error('Error inserting stock history:', historyError);
        alert('Error al registrar el historial de stock.');
        return;
      }

      await renderStock();
      await renderHistorialStock();
      formAñadirStock.reset();
      alert(`${cantidad} pastillas añadidas al stock de ${deposito}.`);
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  });
}

if (formQuitarStock) {
  formQuitarStock.addEventListener('submit', async (e) => {
    e.preventDefault();
    const deposito = document.getElementById('depositoQuitar').value;
    const cantidad = parseInt(document.getElementById('cantidadQuitar').value, 10);

    if (deposito && cantidad > 0) {
      const { data: stockData, error: stockError } = await supabase
        .from('stock')
        .select('id, cantidad')
        .eq('deposito', deposito)
        .single();

      if (stockError) {
        console.error('Error fetching stock:', stockError);
        alert('Error al obtener el stock.');
        return;
      }

      if (stockData.cantidad < cantidad) {
        alert('No hay suficiente stock para quitar esa cantidad.');
        return;
      }

      const nuevaCantidad = stockData.cantidad - cantidad;

      const { error: updateError } = await supabase
        .from('stock')
        .update({ cantidad: nuevaCantidad })
        .eq('id', stockData.id);

      if (updateError) {
        console.error('Error updating stock:', updateError);
        alert('Error al actualizar el stock.');
        return;
      }

      const { error: historyError } = await supabase
        .from('historial_stock')
        .insert([{ tipo: 'extraccion', deposito, cantidad }]);

      if (historyError) {
        console.error('Error inserting stock history:', historyError);
        alert('Error al registrar el historial de stock.');
        return;
      }

      await renderStock();
      await renderHistorialStock();
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
