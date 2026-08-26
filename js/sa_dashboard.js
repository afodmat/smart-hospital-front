// ========================================
// CONFIGURATION
// ========================================

// ========================================
// API REQUEST - FIXED
// ========================================

const API_BASE_URL = 'http://localhost:5001';

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;

    const token = localStorage.getItem('access_token');

    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Add JWT to Authorization header
    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        console.log('📤 API Request:', {
            url,
            method,
        });

        const response = await fetch(url, options);

        const result = await response.json();

        console.log('📦 API response:', result);

        if (!response.ok) {
            throw new Error(
                result.message || `HTTP error ${response.status}`
            );
        }

        return result;

    } catch (error) {
        console.error('❌ API Error:', error);
        throw error;
    }
}

// ========================================
// CHECK AUTHENTICATION
// ========================================

async function checkAuth() {
    try {
        console.log('🔍 Checking admin authentication...');

        const result = await apiRequest('/auth/me', 'GET');

        console.log('✅ /auth/me RESULT:', result);

        if (result.success && result.data) {
            const user = result.data;

            console.log('👤 USER:', user);
            console.log('🎭 ROLE:', user.role);

            if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
                console.log('✅ ADMIN AUTHENTICATION PASSED');
                return true;
            }

            console.log('❌ ROLE REJECTED:', user.role);

            window.location.href = 'login.html';
            return false;
        }

        console.log('❌ /auth/me returned no user');

        window.location.href = 'login.html';
        return false;

    } catch (error) {
        console.error('❌ /auth/me FAILED:', error);

        // TEMPORARILY COMMENT THIS OUT
        // window.location.href = 'login.html';

        return false;
    }
}

// ========================================
// DOM REFERENCES
// ========================================
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const toggleBtn = document.getElementById('toggleSidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const logoutBtn = document.getElementById('logoutBtn');

const appointmentsToggle = document.getElementById('appointmentsToggle');
const appointmentsMenu = document.getElementById('appointmentsMenu');

// ========================================
// SIDEBAR TOGGLE
// ========================================
function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

if (toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);

if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && window.innerWidth <= 768) {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    }
});

// ========================================
// SIDEBAR DROPDOWN
// ========================================
let isDropdownOpen = false;

if (appointmentsToggle && appointmentsMenu) {
    appointmentsToggle.addEventListener('click', () => {
        isDropdownOpen = !isDropdownOpen;
        appointmentsMenu.classList.toggle('open');
        const arrow = appointmentsToggle.querySelector('.arrow');
        if (arrow) arrow.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            appointmentsMenu.classList.remove('open');
            const arrow = appointmentsToggle.querySelector('.arrow');
            if (arrow) arrow.classList.remove('open');
            isDropdownOpen = false;
        }
    });
}

// ========================================
// HIGHLIGHT ACTIVE PAGE
// ========================================
function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'admin-dashboard.html';
    
    document.querySelectorAll('.sidebar-menu a, .sidebar-menu .dropdown-toggle').forEach(el => {
        el.classList.remove('active');
    });
    
    document.querySelectorAll('.dropdown-toggle').forEach(el => {
        el.classList.remove('active-link');
    });

    const links = document.querySelectorAll('.sidebar-menu a');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            
            const dropdown = link.closest('.dropdown');
            if (dropdown) {
                const menu = dropdown.querySelector('.dropdown-menu');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (menu) menu.classList.add('open');
                if (toggle) {
                    toggle.classList.add('active-link');
                    const arrow = toggle.querySelector('.arrow');
                    if (arrow) arrow.classList.add('open');
                }
            }
        }
    });
}

// ========================================
// LOGOUT
// ========================================
function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// ========================================
// LOAD USER DATA
// ========================================
function loadUserData() {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'SA';

            const nameEl = document.getElementById('sidebarName');
            const avatarEl = document.getElementById('sidebarAvatar');
            const topbarAvatar = document.getElementById('topbarAvatar');
            
            if (nameEl) {
                nameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Super Admin';
            }
            if (avatarEl) avatarEl.textContent = initials;
            if (topbarAvatar) topbarAvatar.textContent = initials;
            
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}

// ========================================
// STATUS TOGGLE (Doctor Availability)
// ========================================
let isOnline = true;

function initStatusToggle() {
    const statusToggle = document.getElementById('statusToggle');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');

    if (!statusToggle) return;

    function toggleStatus() {
        isOnline = !isOnline;

        if (isOnline) {
            if (statusIndicator) {
                statusIndicator.className = 'indicator online';
                statusText.textContent = 'Online';
            }
            showToast('You are now ONLINE', 'success');
        } else {
            if (statusIndicator) {
                statusIndicator.className = 'indicator offline';
                statusText.textContent = 'Offline';
            }
            showToast('You are now OFFLINE', 'warning');
        }
    }

    statusToggle.addEventListener('click', toggleStatus);
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase();
        console.log('Searching for:', query);
    });
}

// ========================================
// FETCH PATIENTS (for sa_patients.html)
// ========================================

async function fetchPatients() {
    try {
        console.log('🔍 Fetching patients...');
        
        const loadingState = document.getElementById('loadingState');
        const statsGrid = document.getElementById('statsGrid');
        const patientCard = document.getElementById('patientCard');
        const emptyState = document.getElementById('emptyState');

        if (loadingState) loadingState.style.display = 'block';
        if (statsGrid) statsGrid.style.display = 'none';
        if (patientCard) patientCard.style.display = 'none';
        if (emptyState) emptyState.style.display = 'none';

        const result = await apiRequest('/patients', 'GET');
        console.log('📦 API Response:', result);

        if (loadingState) loadingState.style.display = 'none';

        if (result.success && result.data) {
            const patients = result.data;
            
            updateStats(patients);
            renderPatients(patients);
            
            if (statsGrid) statsGrid.style.display = 'grid';
            if (patientCard) patientCard.style.display = 'block';
            
            const badge = document.getElementById('patientBadge');
            const count = document.getElementById('patientCount');
            if (badge) badge.textContent = patients.length;
            if (count) count.textContent = `${patients.length} patients registered`;

        } else {
            throw new Error(result.message || 'Failed to fetch patients');
        }

    } catch (error) {
        console.error('❌ Fetch patients error:', error);
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.style.display = 'none';
            loadingState.innerHTML = `
                <i class="fas fa-exclamation-circle" style="font-size: 40px; color: var(--danger);"></i>
                <p style="margin-top: 12px; color: var(--gray-500);">Failed to load patients: ${error.message}</p>
                <button onclick="fetchPatients()" style="margin-top: 12px; padding: 8px 24px; background: var(--primary-light); color: white; border: none; border-radius: 6px; cursor: pointer;">Retry</button>
            `;
            loadingState.style.display = 'block';
        }
        showToast('Failed to load patients: ' + error.message, 'error');
    }
}

// ========================================
// UPDATE STATS
// ========================================

function updateStats(patients) {
    const total = patients.length;
    const active = patients.filter(p => p.user?.isEmailVerified === true && !p.deletedAt).length;
    const pending = patients.filter(p => p.user?.isEmailVerified === false && !p.deletedAt).length;
    const inactive = patients.filter(p => p.deletedAt !== null).length;

    const totalEl = document.getElementById('totalPatients');
    const activeEl = document.getElementById('activePatients');
    const pendingEl = document.getElementById('pendingPatients');
    const inactiveEl = document.getElementById('inactivePatients');

    if (totalEl) totalEl.textContent = total;
    if (activeEl) activeEl.textContent = active;
    if (pendingEl) pendingEl.textContent = pending;
    if (inactiveEl) inactiveEl.textContent = inactive;
}

// ========================================
// RENDER PATIENTS
// ========================================

function renderPatients(patients) {
    const tbody = document.getElementById('patientTableBody');
    const emptyState = document.getElementById('emptyState');

    if (!tbody) return;

    if (!patients || patients.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    tbody.innerHTML = '';

    patients.forEach(patient => {
        const tr = document.createElement('tr');
        
        const fullName = patient.user 
            ? `${patient.user.firstName || ''} ${patient.user.lastName || ''}`.trim() 
            : 'Unknown';
        const email = patient.user?.email || 'N/A';
        const phone = patient.phoneNumber || 'N/A';
        
        let statusText = 'Active';
        let statusClass = 'active';
        if (patient.deletedAt) {
            statusText = 'Inactive';
            statusClass = 'inactive';
        } else if (!patient.user?.isEmailVerified) {
            statusText = 'Pending';
            statusClass = 'pending';
        }

        tr.innerHTML = `
            <td><strong>${fullName}</strong></td>
            <td>#${patient.id.toString().padStart(4, '0')}</td>
            <td>${email}</td>
            <td>${phone}</td>
            <td><span class="status-dot ${statusClass}"></span> ${statusText}</td>
            <td>
                <div class="actions">
                    <button class="btn-view" onclick="viewPatient(${patient.id})">View</button>
                    <button class="btn-edit" onclick="editPatient(${patient.id})">Edit</button>
                    <button class="btn-delete" onclick="deletePatient(${patient.id})">Delete</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ========================================
// PATIENT ACTIONS
// ========================================

function viewPatient(id) {
    showToast(`Viewing patient #${id}...`, 'info');
}

function editPatient(id) {
    showToast(`Editing patient #${id}...`, 'info');
}

async function deletePatient(id) {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    showToast(`Patient #${id} deleted successfully!`, 'success');
    await fetchPatients();
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    highlightActivePage();
    initStatusToggle();
    initSearch();
    
    // Fetch patients if on patients page
    if (window.location.pathname.includes('sa_patients.html')) {
        fetchPatients();
    }
});

// ========================================
// CREATE ADMIN
// ========================================

async function createAdmin(adminData) {
    try {
        console.log('📤 Creating admin:', adminData);
        const result = await apiRequest('/admins', 'POST', adminData);
        console.log('📦 Create admin response:', result);
        return result;
    } catch (error) {
        console.error('❌ Create admin error:', error);
        throw error;
    }
}

// ========================================
// DELETE ADMIN
// ========================================

async function deleteAdmin(id) {
    try {
        const result = await apiRequest(`/admins/${id}`, 'DELETE');
        console.log('📦 Delete admin response:', result);
        return result;
    } catch (error) {
        console.error('❌ Delete admin error:', error);
        throw error;
    }
}

// ========================================
// UPDATE ADMIN
// ========================================

async function updateAdmin(id, adminData) {
    try {
        const result = await apiRequest(`/admins/${id}`, 'PUT', adminData);
        console.log('📦 Update admin response:', result);
        return result;
    } catch (error) {
        console.error('❌ Update admin error:', error);
        throw error;
    }
}