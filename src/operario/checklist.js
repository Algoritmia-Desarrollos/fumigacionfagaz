import { renderHeader } from '../common/header.js';
import { renderFooter } from '../common/footer.js';
import { requireRole } from '../common/router.js';

requireRole('operario');
document.getElementById('header').innerHTML = renderHeader();
document.getElementById('footer').innerHTML = renderFooter();

const checklistItems = [
  'Tapar ventiladores',
  'Sanitizar',
  'Verificar presencia de IV',
  'Colocar cartelería'
];
const checklistContainer = document.getElementById('checklistContainer');
let completados = 0;

function getOperacionActual() {
  const id = localStorage.getItem('operacion_actual');
  const operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  return operaciones.find(op => op.id === id);
}

function setChecklistToOperacion(checklist) {
  const id = localStorage.getItem('operacion_actual');
  let operaciones = JSON.parse(localStorage.getItem('operaciones')) || [];
  operaciones = operaciones.map(op => op.id === id ? { ...op, checklist } : op);
  localStorage.setItem('operaciones', JSON.stringify(operaciones));
}

function renderChecklist() {
  const op = getOperacionActual();
  const saved = op && op.checklist ? op.checklist : [];
  checklistContainer.innerHTML = '';
  checklistItems.forEach((item, idx) => {
    const checked = saved[idx]?.completado || false;
    const fotoUrl = saved[idx]?.fotoUrl || '';
    checklistContainer.innerHTML += `
      <div class="flex items-center bg-white border border-[#ebf2e9] rounded-lg px-6 py-4 shadow-sm hover:shadow-md transition-shadow">
        <input class="h-5 w-5 rounded border-2 border-[#53d22c] text-[#53d22c] focus:ring-2 focus:ring-[#53d22c] focus:ring-offset-1 focus:outline-none mr-4" id="item${idx}" type="checkbox" ${checked ? 'checked' : ''} />
        <label class="flex-1 text-base font-medium leading-normal cursor-pointer select-none text-[#121a0f]" for="item${idx}">${item}</label>
        <button type="button" class="flex items-center gap-1.5 text-sm text-[#53d22c] hover:text-green-700 font-semibold px-2 py-1 rounded ml-4" id="btnAdjuntar${idx}">
          <span class="material-icons text-lg">upload_file</span> <span>Adjuntar</span>
        </button>
        <input type="file" accept="image/*" id="foto${idx}" style="display:none" />
        <div id="preview${idx}" class="ml-2">${fotoUrl ? `<img src="${fotoUrl}" alt="Evidencia" class="w-10 h-10 object-cover rounded border" />` : ''}</div>
      </div>
    `;
  });
  // Reasignar listeners después de renderizar
  checklistItems.forEach((_, idx) => {
    document.getElementById(`item${idx}`).addEventListener('change', () => {
      saveChecklist();
      updateProgress();
    });
    document.getElementById(`btnAdjuntar${idx}`).addEventListener('click', () => {
      document.getElementById(`foto${idx}`).click();
    });
    document.getElementById(`foto${idx}`).addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          document.getElementById(`preview${idx}`).innerHTML = `<img src="${ev.target.result}" alt="Evidencia" class="w-10 h-10 object-cover rounded border" />`;
          saveChecklist();
          updateProgress();
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  });
}

function updateProgress() {
  const checks = checklistItems.map((_, idx) => document.getElementById(`item${idx}`));
  completados = checklistItems.filter((_, idx) => checks[idx].checked).length;
  document.getElementById('progreso').innerHTML = `Progreso: <span class="font-bold text-[var(--secondary-color)]">${completados}/4</span>`;
  document.getElementById('progressBar').style.width = `${(completados/4)*100}%`;
  document.getElementById('btnContinuar').disabled = false;
  document.getElementById('checklistMsg').textContent = completados === 4 ? 'Checklist completo. Puede continuar.' : 'Puede continuar aunque no haya completado todos los ítems.';
}

function saveChecklist() {
  const checks = checklistItems.map((_, idx) => document.getElementById(`item${idx}`));
  const fotos = checklistItems.map((_, idx) => {
    const preview = document.getElementById(`preview${idx}`);
    const img = preview && preview.querySelector('img');
    return img ? img.src : '';
  });
  const estadoChecklist = checklistItems.map((item, idx) => ({
    item,
    completado: checks[idx].checked,
    fotoUrl: fotos[idx]
  }));
  setChecklistToOperacion(estadoChecklist);
}

renderChecklist();
updateProgress();

document.getElementById('btnContinuar').addEventListener('click', () => {
  saveChecklist();
  window.location.href = 'operacion.html';
});

document.addEventListener('DOMContentLoaded', () => {
  renderChecklist();
  updateProgress();
});
