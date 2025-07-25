// Global variables
let currentInspectionId = null;
let inspectors = [];
let sites = [];
let products = [];
let checklist = {};
let photos = [];

// Product options
const PRODUCT_OPTIONS = ['NPW', 'NCN-45HD', 'NCB790', 'NFB'];

// Checklist items
const CHECKLIST_ITEMS = [
    { category: '설치', item: '외관점검' },
    { category: '설치', item: '가스배관 연결상태' },
    { category: '설치', item: '급수배관 연결상태' },
    { category: '설치', item: '온수배관 연결상태' },
    { category: '설치', item: '전원선 연결상태' },
    { category: '설치', item: '배기관 연결상태' },
    { category: '설치', item: '응축수 배관' },
    { category: '설치', item: '직수/환수 급기필터' },
    { category: 'Check', item: '송풍기' },
    { category: 'Check', item: '가스밸브' },
    { category: 'Check', item: '점화장치' },
    { category: 'Check', item: '화염감지장치' },
    { category: 'Check', item: '듀얼벤츄리' },
    { category: 'Check', item: '열교환기' },
    { category: 'Check', item: '펌프' },
    { category: 'Check', item: '팽창탱크' },
    { category: 'Check', item: '안전밸브' },
    { category: 'Check', item: '압력게이지' },
    { category: 'Check', item: '온도센서' },
    { category: 'Check', item: '압력스위치' },
    { category: 'Check', item: '믹싱밸브' },
    { category: 'Check', item: '삼방밸브' },
    { category: 'Check', item: '제어판넬' }
];

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showLoading(show = true) {
    const loading = document.getElementById('loading');
    loading.classList.toggle('show', show);
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
}

function calculateYearsInUse(installationDate) {
    if (!installationDate) return '';
    
    const install = new Date(installationDate);
    const now = new Date();
    const diffTime = Math.abs(now - install);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years === 0) {
        return `${months}개월`;
    } else if (months === 0) {
        return `${years}년`;
    } else {
        return `${years}년 ${months}개월`;
    }
}

// API functions
async function apiRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Data loading functions
async function loadInspectors() {
    try {
        inspectors = await apiRequest('/api/inspectors');
        updateInspectorSelect();
        renderInspectorsList();
    } catch (error) {
        showToast('점검자 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function loadSites() {
    try {
        sites = await apiRequest('/api/sites');
        updateSiteSelect();
        renderSitesList();
    } catch (error) {
        showToast('현장 목록을 불러오는데 실패했습니다.', 'error');
    }
}

async function loadInspections() {
    try {
        const inspections = await apiRequest('/api/inspections');
        renderInspectionsList(inspections);
    } catch (error) {
        showToast('점검 목록을 불러오는데 실패했습니다.', 'error');
    }
}

// UI update functions
function updateInspectorSelect() {
    const select = document.getElementById('inspectorId');
    select.innerHTML = '<option value="">점검자를 선택하세요</option>';
    inspectors.forEach(inspector => {
        const option = document.createElement('option');
        option.value = inspector.id;
        option.textContent = inspector.name;
        select.appendChild(option);
    });
}

function updateSiteSelect() {
    const select = document.getElementById('siteId');
    select.innerHTML = '<option value="">현장을 선택하세요</option>';
    sites.forEach(site => {
        const option = document.createElement('option');
        option.value = site.id;
        option.textContent = site.name;
        select.appendChild(option);
    });
}

function renderInspectionsList(inspections) {
    const container = document.getElementById('inspections-list');
    
    if (inspections.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">점검 기록이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = inspections.map(inspection => `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-lg">${inspection.documentNumber || 'N/A'}</h3>
                    <p class="text-gray-600">현장: ${inspection.site || 'N/A'}</p>
                    <p class="text-gray-600">점검자: ${inspection.inspector || 'N/A'}</p>
                    <p class="text-gray-600">점검일: ${inspection.inspectionDate || 'N/A'}</p>
                    <p class="text-gray-600">결과: <span class="font-medium ${getResultColor(inspection.result)}">${inspection.result || 'N/A'}</span></p>
                </div>
                <div class="space-x-2">
                    <button onclick="editInspection('${inspection.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                        수정
                    </button>
                    <button onclick="viewInspection('${inspection.id}')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        보기
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderInspectorsList() {
    const container = document.getElementById('inspectors-list');
    
    if (inspectors.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 점검자가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = inspectors.map(inspector => `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold">${inspector.name}</h3>
                    <p class="text-gray-600">전화: ${inspector.phone || 'N/A'}</p>
                    <p class="text-gray-600">이메일: ${inspector.email || 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderSitesList() {
    const container = document.getElementById('sites-list');
    
    if (sites.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">등록된 현장이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = sites.map(site => `
        <div class="bg-white p-4 rounded-lg shadow">
            <div class="flex justify-between items-center">
                <div>
                    <h3 class="font-semibold">${site.name}</h3>
                    <p class="text-gray-600">주소: ${site.address || 'N/A'}</p>
                    <p class="text-gray-600">담당자: ${site.contactPerson || 'N/A'}</p>
                    <p class="text-gray-600">연락처: ${site.contactPhone || 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function getResultColor(result) {
    switch(result) {
        case '양호': return 'text-green-600';
        case '보통': return 'text-yellow-600';
        case '불량': return 'text-red-600';
        default: return 'text-gray-600';
    }
}

// Product management
function addProduct() {
    const product = {
        name: '',
        count: 1
    };
    products.push(product);
    renderProducts();
}

function removeProduct(index) {
    products.splice(index, 1);
    renderProducts();
}

function updateProduct(index, field, value) {
    if (products[index]) {
        products[index][field] = value;
        updateProductsSummary();
    }
}

function renderProducts() {
    const container = document.getElementById('products-container');
    
    container.innerHTML = products.map((product, index) => `
        <div class="product-card">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                    <label class="block text-sm font-medium mb-2">제품명</label>
                    <select onchange="updateProduct(${index}, 'name', this.value)" class="w-full p-2 border rounded-md">
                        <option value="">제품을 선택하세요</option>
                        ${PRODUCT_OPTIONS.map(option => 
                            `<option value="${option}" ${product.name === option ? 'selected' : ''}>${option}</option>`
                        ).join('')}
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">설치대수</label>
                    <div class="flex items-center gap-2">
                        <input type="number" min="1" value="${product.count}" 
                               onchange="updateProduct(${index}, 'count', parseInt(this.value) || 1)"
                               class="w-full p-2 border rounded-md text-center">
                        <span class="text-sm text-gray-500">대</span>
                    </div>
                </div>
                <div class="flex justify-end">
                    <button type="button" onclick="removeProduct(${index})" 
                            class="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    updateProductsSummary();
}

function updateProductsSummary() {
    const totalCount = products.reduce((sum, product) => sum + (product.count || 0), 0);
    const summary = document.getElementById('products-summary');
    if (summary && totalCount > 0) {
        summary.textContent = `총 ${totalCount}대 설치`;
    } else if (summary) {
        summary.textContent = '';
    }
}

// Checklist management
function initializeChecklist() {
    checklist = {};
    CHECKLIST_ITEMS.forEach((item, index) => {
        checklist[`item${index}`] = {
            category: item.category,
            item: item.item,
            result: '',
            reason: ''
        };
    });
    renderChecklist();
}

function renderChecklist() {
    const container = document.getElementById('checklist-container');
    
    container.innerHTML = Object.keys(checklist).map((key, index) => {
        const item = checklist[key];
        return `
            <div class="checklist-item p-3">
                <div class="flex items-center justify-between cursor-pointer" onclick="toggleChecklistItem(${index})">
                    <div class="flex items-center space-x-3">
                        <span class="text-xs bg-gray-200 px-2 py-1 rounded">${item.category}</span>
                        <span class="font-medium">${item.item}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <select onchange="updateChecklistItem('${key}', 'result', this.value)" 
                                class="text-sm border rounded px-2 py-1" onclick="event.stopPropagation()">
                            <option value="">선택</option>
                            <option value="yes" ${item.result === 'yes' ? 'selected' : ''}>예</option>
                            <option value="no" ${item.result === 'no' ? 'selected' : ''}>아니오</option>
                        </select>
                        <i class="fas fa-chevron-down text-gray-400"></i>
                    </div>
                </div>
                <div id="checklist-detail-${index}" style="display: ${item.result === 'no' ? 'block' : 'none'};" class="mt-3 pl-4">
                    <label class="block text-sm font-medium mb-1">사유:</label>
                    <input type="text" value="${item.reason || ''}" 
                           onchange="updateChecklistItem('${key}', 'reason', this.value)"
                           class="w-full text-sm border rounded px-2 py-1" placeholder="아니오 선택 시 사유를 입력하세요">
                </div>
            </div>
        `;
    }).join('');
}

function toggleChecklistItem(index) {
    const detail = document.getElementById(`checklist-detail-${index}`);
    const isVisible = detail.style.display !== 'none';
    detail.style.display = isVisible ? 'none' : 'block';
}

function updateChecklistItem(key, field, value) {
    if (checklist[key]) {
        checklist[key][field] = value;
        
        // Show/hide reason input based on result
        if (field === 'result') {
            const index = Object.keys(checklist).indexOf(key);
            const detail = document.getElementById(`checklist-detail-${index}`);
            if (detail) {
                detail.style.display = value === 'no' ? 'block' : 'none';
            }
        }
    }
}

function setAllYes() {
    Object.keys(checklist).forEach(key => {
        checklist[key].result = 'yes';
        checklist[key].reason = '';
    });
    renderChecklist();
}

// Photo management
function setupPhotoUpload() {
    const input = document.getElementById('photo-upload');
    input.addEventListener('change', handlePhotoUpload);
}

async function handlePhotoUpload(event) {
    const files = event.target.files;
    if (!files.length) return;
    
    if (!currentInspectionId) {
        currentInspectionId = generateUUID();
    }
    
    showLoading(true);
    
    try {
        for (const file of files) {
            const formData = new FormData();
            formData.append('photo', file);
            
            const response = await fetch(`/api/inspections/${currentInspectionId}/photos`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Photo upload failed');
            }
            
            const result = await response.json();
            photos.push(result.photoUrl);
        }
        
        renderPhotos();
        showToast('사진이 업로드되었습니다.');
    } catch (error) {
        showToast('사진 업로드에 실패했습니다.', 'error');
    } finally {
        showLoading(false);
        event.target.value = ''; // Reset file input
    }
}

function renderPhotos() {
    const container = document.getElementById('photos-container');
    
    container.innerHTML = photos.map((photoUrl, index) => `
        <div class="relative">
            <img src="${photoUrl}" alt="점검 사진" class="photo-preview">
            <button type="button" onclick="removePhoto(${index})" 
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs hover:bg-red-600">
                ×
            </button>
        </div>
    `).join('');
}

function removePhoto(index) {
    photos.splice(index, 1);
    renderPhotos();
}

// Form management
function resetForm() {
    currentInspectionId = null;
    products = [];
    photos = [];
    checklist = {};
    
    document.getElementById('inspection-form').reset();
    document.getElementById('inspectionDate').value = formatDate(new Date());
    
    initializeChecklist();
    renderProducts();
    renderPhotos();
    updateProductsSummary();
}

function setupFormHandlers() {
    // Installation date change handler
    document.getElementById('installationDate').addEventListener('change', function() {
        const yearsDiv = document.getElementById('yearsInUse');
        yearsDiv.textContent = calculateYearsInUse(this.value);
    });
    
    // Form submission handlers
    document.getElementById('inspector-form').addEventListener('submit', handleInspectorSubmit);
    document.getElementById('site-form').addEventListener('submit', handleSiteSubmit);
}

async function handleInspectorSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('inspector-name').value,
        phone: document.getElementById('inspector-phone').value,
        email: document.getElementById('inspector-email').value
    };
    
    try {
        showLoading(true);
        await apiRequest('/api/inspectors', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        document.getElementById('inspector-form').reset();
        await loadInspectors();
        showToast('점검자가 추가되었습니다.');
    } catch (error) {
        showToast('점검자 추가에 실패했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleSiteSubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('site-name').value,
        address: document.getElementById('site-address').value,
        contactPerson: document.getElementById('site-contact-person').value,
        contactPhone: document.getElementById('site-contact-phone').value
    };
    
    try {
        showLoading(true);
        await apiRequest('/api/sites', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        document.getElementById('site-form').reset();
        await loadSites();
        showToast('현장이 추가되었습니다.');
    } catch (error) {
        showToast('현장 추가에 실패했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// Inspection management
async function saveInspection() {
    try {
        showLoading(true);
        
        if (!currentInspectionId) {
            currentInspectionId = generateUUID();
        }
        
        const formData = {
            documentNumber: document.getElementById('documentNumber').value,
            inspectionDate: document.getElementById('inspectionDate').value,
            inspectorId: parseInt(document.getElementById('inspectorId').value) || null,
            siteId: parseInt(document.getElementById('siteId').value) || null,
            installationLocation: document.getElementById('installationLocation').value,
            installationDate: document.getElementById('installationDate').value,
            yearsInUse: document.getElementById('yearsInUse').textContent,
            products: products,
            fuelType: document.getElementById('fuelType').value,
            manufactureYear: document.getElementById('manufactureYear').value,
            ratedVoltage: document.getElementById('ratedVoltage').value,
            pipingType: document.getElementById('pipingType').value,
            waterQuality: document.getElementById('waterQuality').value,
            controlMethod: document.getElementById('controlMethod').value,
            installationPurpose: document.getElementById('installationPurpose').value,
            productForm: document.getElementById('productForm').value,
            result: document.getElementById('result').value,
            summary: document.getElementById('summary').value,
            siteCondition: document.getElementById('siteCondition').value,
            checklist: checklist,
            photos: photos
        };
        
        const url = `/api/inspections${currentInspectionId ? '/' + currentInspectionId : ''}`;
        const method = currentInspectionId ? 'PUT' : 'POST';
        
        await apiRequest(url, {
            method: method,
            body: JSON.stringify(formData)
        });
        
        showToast('점검이 저장되었습니다.');
        
        // Reload inspections list
        await loadInspections();
        
    } catch (error) {
        showToast('점검 저장에 실패했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

async function editInspection(inspectionId) {
    try {
        showLoading(true);
        
        const inspection = await apiRequest(`/api/inspections/${inspectionId}`);
        
        // Set current inspection ID
        currentInspectionId = inspectionId;
        
        // Fill form fields
        document.getElementById('documentNumber').value = inspection.documentNumber || '';
        document.getElementById('inspectionDate').value = inspection.inspectionDate || '';
        document.getElementById('inspectorId').value = inspection.inspectorId || '';
        document.getElementById('siteId').value = inspection.siteId || '';
        document.getElementById('installationLocation').value = inspection.installationLocation || '';
        document.getElementById('installationDate').value = inspection.installationDate || '';
        document.getElementById('fuelType').value = inspection.fuelType || '';
        document.getElementById('manufactureYear').value = inspection.manufactureYear || '';
        document.getElementById('ratedVoltage').value = inspection.ratedVoltage || '';
        document.getElementById('pipingType').value = inspection.pipingType || '';
        document.getElementById('waterQuality').value = inspection.waterQuality || '';
        document.getElementById('controlMethod').value = inspection.controlMethod || '';
        document.getElementById('installationPurpose').value = inspection.installationPurpose || '';
        document.getElementById('productForm').value = inspection.productForm || '';
        document.getElementById('result').value = inspection.result || '';
        document.getElementById('summary').value = inspection.summary || '';
        document.getElementById('siteCondition').value = inspection.siteCondition || '';
        
        // Set products, checklist, and photos
        products = inspection.products || [];
        checklist = inspection.checklist || {};
        photos = inspection.photos || [];
        
        // Update years in use
        document.getElementById('yearsInUse').textContent = inspection.yearsInUse || '';
        
        // Re-render components
        renderProducts();
        renderChecklist();
        renderPhotos();
        
        // Show new inspection section
        showSection('new-inspection');
        
        showToast('점검을 불러왔습니다.');
        
    } catch (error) {
        showToast('점검을 불러오는데 실패했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

async function viewInspection(inspectionId) {
    // For now, just edit the inspection
    await editInspection(inspectionId);
}

function generatePDF() {
    showToast('PDF 생성 기능은 개발 중입니다.', 'error');
}

// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('[id$="-section"]').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show selected section
    const section = document.getElementById(sectionName + '-section');
    if (section) {
        section.style.display = 'block';
    }
    
    // Special handling for new inspection
    if (sectionName === 'new-inspection') {
        resetForm();
    }
}

// Initialize app
async function initializeApp() {
    try {
        showLoading(true);
        
        // Setup event handlers
        setupFormHandlers();
        setupPhotoUpload();
        
        // Load initial data
        await Promise.all([
            loadInspectors(),
            loadSites(),
            loadInspections()
        ]);
        
        // Initialize checklist
        initializeChecklist();
        
        // Set default date
        document.getElementById('inspectionDate').value = formatDate(new Date());
        
        showToast('앱이 초기화되었습니다.');
        
    } catch (error) {
        showToast('앱 초기화에 실패했습니다.', 'error');
    } finally {
        showLoading(false);
    }
}

// Start the app when page loads
document.addEventListener('DOMContentLoaded', initializeApp);