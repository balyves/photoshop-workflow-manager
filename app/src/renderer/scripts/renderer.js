/**
 * Photoshop Workflow Manager
 * Renderer Process - Logique UI
 */

const { ipcRenderer } = require('electron');

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

let config = null;
let presets = [];
let currentCategory = null;
let currentSubcategory = null;
let currentScript = null;
let currentParams = {};
let currentUnit = 'mm';
let batchMode = false;
let inputFolder = null;
let outputFolder = null;

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════

const ICONS = {
  'newspaper': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2M18 14h-8M15 18h-5M10 6h8v4h-8V6z"/></svg>`,
  'shopping-cart': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`,
  'monitor': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  'camera': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  'film': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>`,
  'image': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  'maximize': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
  'grid': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
  'layers': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

async function init() {
  try {
    config = await ipcRenderer.invoke('get-config');
    presets = await ipcRenderer.invoke('get-presets') || [];
    
    if (!config) {
      showToast('Erreur de chargement de la configuration', 'error');
      return;
    }
    
    renderUnitButtons();
    renderCommonTools();
    renderCategoryTabs();
    renderPresets();
    setupEventListeners();
    
    // Sélectionner la première catégorie
    if (config.categories && config.categories.length > 0) {
      selectCategory(config.categories[0].id);
    }
    
  } catch (error) {
    console.error('Init error:', error);
    showToast('Erreur d\'initialisation', 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RENDERING
// ═══════════════════════════════════════════════════════════════════════════════

function renderUnitButtons() {
  const container = document.getElementById('unit-buttons');
  container.innerHTML = '';
  
  const units = config.units?.available || [
    { id: 'pt', name: 'pt' },
    { id: 'mm', name: 'mm' },
    { id: 'cm', name: 'cm' },
    { id: 'inch', name: 'Inch' },
    { id: 'px', name: 'px' }
  ];
  
  units.forEach(unit => {
    const btn = document.createElement('button');
    btn.className = `unit-btn ${unit.id === currentUnit ? 'active' : ''}`;
    btn.dataset.unit = unit.id;
    btn.textContent = unit.id;
    btn.onclick = () => selectUnit(unit.id);
    container.appendChild(btn);
  });
}

function renderCommonTools() {
  const container = document.getElementById('common-tools');
  container.innerHTML = '';
  
  if (!config.common_scripts) return;
  
  config.common_scripts.forEach(script => {
    const btn = document.createElement('button');
    btn.className = 'tool-btn';
    btn.title = script.name;
    btn.innerHTML = ICONS[script.icon] || ICONS['image'];
    btn.onclick = () => selectScript(script, null);
    container.appendChild(btn);
  });
}

function renderCategoryTabs() {
  const container = document.getElementById('category-tabs');
  container.innerHTML = '';
  
  if (!config.categories) return;
  
  config.categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.category = category.id;
    btn.innerHTML = `
      <span class="tab-icon">${ICONS[category.icon] || ''}</span>
      <span>${category.name}</span>
    `;
    btn.onclick = () => selectCategory(category.id);
    container.appendChild(btn);
  });
}

function renderSubTabs(category) {
  const container = document.getElementById('sub-tabs');
  container.innerHTML = '';
  
  // Subcategories
  if (category.subcategories && category.subcategories.length > 0) {
    category.subcategories.forEach(sub => {
      const group = document.createElement('div');
      group.className = 'sub-tab-group';
      
      const label = document.createElement('span');
      label.className = 'sub-tab-label';
      label.textContent = sub.name;
      group.appendChild(label);
      
      sub.scripts?.forEach(script => {
        const btn = document.createElement('button');
        btn.className = 'sub-tab-btn';
        btn.textContent = script.name;
        btn.onclick = () => selectScript(script, sub.id);
        group.appendChild(btn);
      });
      
      container.appendChild(group);
      
      if (category.subcategories.indexOf(sub) < category.subcategories.length - 1 || category.scripts?.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'sub-tab-divider';
        container.appendChild(divider);
      }
    });
  }
  
  // General scripts
  if (category.scripts && category.scripts.length > 0) {
    const group = document.createElement('div');
    group.className = 'sub-tab-group';
    
    if (category.subcategories && category.subcategories.length > 0) {
      const label = document.createElement('span');
      label.className = 'sub-tab-label';
      label.textContent = 'Général';
      group.appendChild(label);
    }
    
    category.scripts.forEach(script => {
      const btn = document.createElement('button');
      btn.className = 'sub-tab-btn';
      btn.textContent = script.name;
      btn.onclick = () => selectScript(script, null);
      group.appendChild(btn);
    });
    
    container.appendChild(group);
  }
  
  // Empty message
  if ((!category.scripts || category.scripts.length === 0) && 
      (!category.subcategories || category.subcategories.length === 0)) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 12px;">
        <span style="color: var(--text-muted); font-size: 11px;">
          Aucun script dans cette catégorie
        </span>
      </div>
    `;
  }
}

function renderParams(script) {
  const form = document.getElementById('params-form');
  const title = document.getElementById('script-title');
  const description = document.getElementById('script-description');
  
  title.textContent = script.name;
  description.textContent = script.description || '';
  
  form.innerHTML = '';
  currentParams = {};
  
  if (!script.params || script.params.length === 0) {
    form.innerHTML = `
      <div class="empty-state">
        <p>Ce script n'a pas de paramètres configurables</p>
      </div>
    `;
    return;
  }
  
  script.params.forEach(param => {
    const group = document.createElement('div');
    group.className = `form-group ${param.type === 'multiselect' ? 'full-width' : ''}`;
    
    const label = document.createElement('label');
    label.textContent = param.name;
    group.appendChild(label);
    
    let input;
    
    switch (param.type) {
      case 'number':
        if (param.unit) {
          const wrapper = document.createElement('div');
          wrapper.className = 'input-with-unit';
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'input-field';
          input.value = param.default || '';
          input.placeholder = param.placeholder || '';
          const unitLabel = document.createElement('span');
          unitLabel.className = 'unit-label';
          unitLabel.textContent = currentUnit;
          wrapper.appendChild(input);
          wrapper.appendChild(unitLabel);
          group.appendChild(wrapper);
        } else {
          input = document.createElement('input');
          input.type = 'number';
          input.className = 'input-field';
          input.value = param.default || '';
          input.placeholder = param.placeholder || '';
          input.style.width = '100%';
          group.appendChild(input);
        }
        break;
        
      case 'text':
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'input-field';
        input.value = param.default || '';
        input.placeholder = param.placeholder || '';
        input.style.width = '100%';
        group.appendChild(input);
        break;
        
      case 'select':
        input = document.createElement('select');
        input.className = 'select-field';
        input.style.width = '100%';
        param.options.forEach(opt => {
          const option = document.createElement('option');
          option.value = typeof opt === 'object' ? opt.value : opt;
          option.textContent = typeof opt === 'object' ? opt.label : opt;
          if ((typeof opt === 'object' ? opt.value : opt) === param.default) {
            option.selected = true;
          }
          input.appendChild(option);
        });
        group.appendChild(input);
        break;
        
      case 'range':
        const rangeContainer = document.createElement('div');
        rangeContainer.className = 'range-container';
        input = document.createElement('input');
        input.type = 'range';
        input.min = param.min || 0;
        input.max = param.max || 100;
        input.value = param.default || 50;
        const rangeValue = document.createElement('span');
        rangeValue.className = 'range-value';
        rangeValue.textContent = input.value;
        input.oninput = () => { rangeValue.textContent = input.value; };
        rangeContainer.appendChild(input);
        rangeContainer.appendChild(rangeValue);
        group.appendChild(rangeContainer);
        break;
        
      case 'boolean':
        const checkboxGroup = document.createElement('label');
        checkboxGroup.className = 'checkbox-group';
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = param.default || false;
        const checkLabel = document.createElement('span');
        checkLabel.textContent = param.name;
        checkboxGroup.appendChild(input);
        checkboxGroup.appendChild(checkLabel);
        group.innerHTML = '';
        group.appendChild(checkboxGroup);
        break;
        
      case 'multiselect':
        const multiContainer = document.createElement('div');
        multiContainer.className = 'multiselect-container';
        input = { type: 'multiselect', values: new Set(param.default || []) };
        param.options.forEach(opt => {
          const optBtn = document.createElement('button');
          optBtn.className = `multiselect-option ${input.values.has(opt.value) ? 'selected' : ''}`;
          optBtn.textContent = opt.label;
          optBtn.onclick = () => {
            if (input.values.has(opt.value)) {
              input.values.delete(opt.value);
              optBtn.classList.remove('selected');
            } else {
              input.values.add(opt.value);
              optBtn.classList.add('selected');
            }
            currentParams[param.id] = Array.from(input.values);
          };
          multiContainer.appendChild(optBtn);
        });
        group.appendChild(multiContainer);
        currentParams[param.id] = Array.from(input.values);
        break;
    }
    
    if (input && input.type !== 'multiselect') {
      input.dataset.paramId = param.id;
      input.onchange = () => updateParam(param.id, input);
      currentParams[param.id] = param.type === 'boolean' ? param.default : (param.default || '');
    }
    
    form.appendChild(group);
  });
  
  document.getElementById('btn-run').disabled = false;
}

function renderPresets() {
  const container = document.getElementById('presets-list');
  
  if (!presets || presets.length === 0) {
    container.innerHTML = '<div class="empty-presets">Aucun preset</div>';
    return;
  }
  
  container.innerHTML = '';
  
  presets.forEach((preset, index) => {
    const item = document.createElement('div');
    item.className = 'preset-item';
    item.innerHTML = `
      <div class="preset-item-name">${preset.name}</div>
      <div class="preset-item-meta">${preset.scriptName || ''}</div>
      <div class="preset-item-actions">
        <button class="btn-icon" onclick="loadPreset(${index})" title="Charger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/>
            <path d="M20.88 18.09A5 5 0 0018 9h-1.26A8 8 0 103 16.29"/>
          </svg>
        </button>
        <button class="btn-icon" onclick="deletePreset(${index})" title="Supprimer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
        </button>
      </div>
    `;
    item.onclick = (e) => {
      if (!e.target.closest('.btn-icon')) {
        loadPreset(index);
      }
    };
    container.appendChild(item);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION & ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function selectUnit(unitId) {
  currentUnit = unitId;
  
  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === unitId);
  });
  
  document.querySelectorAll('.unit-label').forEach(label => {
    label.textContent = unitId;
  });
}

function selectCategory(categoryId) {
  currentCategory = config.categories.find(c => c.id === categoryId);
  currentSubcategory = null;
  currentScript = null;
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === categoryId);
  });
  
  renderSubTabs(currentCategory);
  
  document.getElementById('script-title').textContent = 'Sélectionnez un script';
  document.getElementById('script-description').textContent = '';
  document.getElementById('params-form').innerHTML = `
    <div class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
      </svg>
      <p>Sélectionnez un script dans la liste ci-dessus</p>
    </div>
  `;
  document.getElementById('btn-run').disabled = true;
}

function selectScript(script, subcategoryId) {
  currentScript = script;
  currentSubcategory = subcategoryId;
  
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === script.name);
  });
  
  document.querySelectorAll('.tool-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  renderParams(script);
}

function updateParam(paramId, input) {
  if (input.type === 'checkbox') {
    currentParams[paramId] = input.checked;
  } else {
    currentParams[paramId] = input.value;
  }
}

function getParams() {
  const params = { ...currentParams };
  
  document.querySelectorAll('#params-form input, #params-form select').forEach(input => {
    if (input.dataset.paramId) {
      if (input.type === 'checkbox') {
        params[input.dataset.paramId] = input.checked;
      } else {
        params[input.dataset.paramId] = input.value;
      }
    }
  });
  
  params._unit = currentUnit;
  return params;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

async function savePreset() {
  if (!currentScript) {
    showToast('Sélectionnez d\'abord un script', 'warning');
    return;
  }
  
  const modal = document.getElementById('modal-overlay');
  const nameInput = document.getElementById('preset-name');
  nameInput.value = '';
  modal.style.display = 'flex';
  nameInput.focus();
}

async function confirmSavePreset() {
  const name = document.getElementById('preset-name').value.trim();
  if (!name) {
    showToast('Veuillez entrer un nom', 'warning');
    return;
  }
  
  const preset = {
    name,
    categoryId: currentCategory?.id,
    subcategoryId: currentSubcategory,
    scriptId: currentScript.id,
    scriptName: currentScript.name,
    params: getParams(),
    createdAt: new Date().toISOString()
  };
  
  presets.push(preset);
  
  const success = await ipcRenderer.invoke('save-presets', presets);
  if (success) {
    renderPresets();
    showToast('Preset sauvegardé', 'success');
  } else {
    showToast('Erreur de sauvegarde', 'error');
  }
  
  closeModal();
}

function loadPreset(index) {
  const preset = presets[index];
  if (!preset) return;
  
  if (preset.categoryId) {
    selectCategory(preset.categoryId);
  }
  
  let script = null;
  if (currentCategory) {
    script = currentCategory.scripts?.find(s => s.id === preset.scriptId);
    if (!script && currentCategory.subcategories) {
      for (const sub of currentCategory.subcategories) {
        script = sub.scripts?.find(s => s.id === preset.scriptId);
        if (script) break;
      }
    }
  }
  if (!script) {
    script = config.common_scripts?.find(s => s.id === preset.scriptId);
  }
  
  if (script) {
    selectScript(script, preset.subcategoryId);
    
    setTimeout(() => {
      Object.entries(preset.params).forEach(([key, value]) => {
        const input = document.querySelector(`[data-param-id="${key}"]`);
        if (input) {
          if (input.type === 'checkbox') {
            input.checked = value;
          } else {
            input.value = value;
          }
        }
        currentParams[key] = value;
      });
      
      if (preset.params._unit) {
        selectUnit(preset.params._unit);
      }
    }, 100);
    
    showToast(`Preset "${preset.name}" chargé`, 'success');
  }
}

async function deletePreset(index) {
  presets.splice(index, 1);
  await ipcRenderer.invoke('save-presets', presets);
  renderPresets();
  showToast('Preset supprimé', 'success');
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function runScript() {
  if (!currentScript) {
    showToast('Sélectionnez un script', 'warning');
    return;
  }
  
  const params = getParams();
  
  try {
    let result;
    
    if (batchMode) {
      if (!inputFolder || !outputFolder) {
        showToast('Sélectionnez les dossiers source et sortie', 'warning');
        return;
      }
      
      result = await ipcRenderer.invoke('run-batch', {
        scriptFile: currentScript.file,
        inputFolder,
        outputFolder,
        params
      });
    } else {
      result = await ipcRenderer.invoke('run-script', {
        scriptFile: currentScript.file,
        params
      });
    }
    
    if (result.success) {
      showToast('Script exécuté avec succès', 'success');
    } else {
      showToast(result.error || 'Erreur d\'exécution', 'error');
    }
  } catch (error) {
    showToast('Erreur: ' + error.message, 'error');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH MODE
// ═══════════════════════════════════════════════════════════════════════════════

function toggleBatchMode(enabled) {
  batchMode = enabled;
  document.getElementById('batch-folders').style.display = enabled ? 'flex' : 'none';
}

async function selectInputFolder() {
  const folder = await ipcRenderer.invoke('select-folder', { title: 'Sélectionner le dossier source' });
  if (folder) {
    inputFolder = folder;
    document.getElementById('input-folder-label').textContent = folder.split('/').pop();
    document.getElementById('btn-input-folder').classList.add('selected');
  }
}

async function selectOutputFolder() {
  const folder = await ipcRenderer.invoke('select-folder', { title: 'Sélectionner le dossier de sortie' });
  if (folder) {
    outputFolder = folder;
    document.getElementById('output-folder-label').textContent = folder.split('/').pop();
    document.getElementById('btn-output-folder').classList.add('selected');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

async function refresh() {
  config = await ipcRenderer.invoke('get-config');
  presets = await ipcRenderer.invoke('get-presets') || [];
  
  renderCategoryTabs();
  renderCommonTools();
  renderPresets();
  
  if (currentCategory) {
    selectCategory(currentCategory.id);
  }
  
  showToast('Configuration rechargée', 'success');
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
  document.getElementById('btn-refresh').onclick = refresh;
  document.getElementById('btn-settings').onclick = () => ipcRenderer.invoke('open-config');
  document.getElementById('btn-folder').onclick = () => ipcRenderer.invoke('open-user-folder');
  
  document.getElementById('batch-mode').onchange = (e) => toggleBatchMode(e.target.checked);
  document.getElementById('btn-input-folder').onclick = selectInputFolder;
  document.getElementById('btn-output-folder').onclick = selectOutputFolder;
  document.getElementById('btn-cancel').onclick = () => {
    currentScript = null;
    document.querySelectorAll('.sub-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('btn-run').disabled = true;
  };
  document.getElementById('btn-run').onclick = runScript;
  
  document.getElementById('btn-save-preset').onclick = savePreset;
  document.getElementById('modal-close').onclick = closeModal;
  document.getElementById('modal-cancel').onclick = closeModal;
  document.getElementById('modal-save').onclick = confirmSavePreset;
  document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target.id === 'modal-overlay') closeModal();
  };
  
  document.addEventListener('keydown', (e) => {
    if (e.metaKey && e.key === 'r') {
      e.preventDefault();
      refresh();
    }
    if (e.metaKey && e.key === 'Enter') {
      e.preventDefault();
      runScript();
    }
    if (e.key === 'Escape') {
      closeModal();
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

window.loadPreset = loadPreset;
window.deletePreset = deletePreset;

// ═══════════════════════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', init);
