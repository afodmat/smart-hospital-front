// ========================================
// CONFIGURATION
// ========================================

// ========================================
// API REQUEST - FIXED
// ========================================

const API_BASE_URL = 'https://smart-hospital-fet1.onrender.com';

let allDoctors = [];

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;


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

const doctorsToggle = document.getElementById('doctorsToggle'); 
const doctorsMenu = document.getElementById('doctorsMenu');

const adminToggle = document.getElementById('adminToggle');
const adminMenu = document.getElementById('adminMenu');

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
// SIDEBAR DROPDOWN - DOCTORS
// ========================================

let isDropdownOpen = false;

if (doctorsToggle && doctorsMenu) {

    doctorsToggle.addEventListener('click', () => {

        isDropdownOpen = !isDropdownOpen;

        doctorsMenu.classList.toggle('open');

        const arrow = doctorsToggle.querySelector('.arrow');

        if (arrow) {
            arrow.classList.toggle('open');
        }

    });


    document.addEventListener('click', (e) => {

        const dropdown = doctorsToggle.closest('.dropdown');

        if (dropdown && !dropdown.contains(e.target)) {

            doctorsMenu.classList.remove('open');

            const arrow =
                doctorsToggle.querySelector('.arrow');

            if (arrow) {
                arrow.classList.remove('open');
            }

            isDropdownOpen = false;

        }

    });

}

// ========================================
// SIDEBAR DROPDOWN - ADMIN
// ========================================

let isAdminDropdownOpen = false;

if (adminToggle && adminMenu) {

    adminToggle.addEventListener('click', () => {

        isAdminDropdownOpen = !isAdminDropdownOpen;

        adminMenu.classList.toggle('open');

        const arrow = adminToggle.querySelector('.arrow');

        if (arrow) {
            arrow.classList.toggle('open');
        }

    });

    document.addEventListener('click', (e) => {

        const dropdown = adminToggle.closest('.dropdown');

        if (dropdown && !dropdown.contains(e.target)) {

            adminMenu.classList.remove('open');

            const arrow = adminToggle.querySelector('.arrow');

            if (arrow) {
                arrow.classList.remove('open');
            }

            isAdminDropdownOpen = false;

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

        const query = e.target.value
            .trim()
            .toLowerCase();

        // If search is empty, show everyone
        if (!query) {
            renderDoctors(allDoctors);
            return;
        }

        const filteredDoctors = allDoctors.filter(doctor => {

            const firstName =
                doctor.user?.firstName?.toLowerCase() || '';

            const lastName =
                doctor.user?.lastName?.toLowerCase() || '';

            const otherNames =
                doctor.user?.otherNames?.toLowerCase() || '';

            const email =
                doctor.user?.email?.toLowerCase() || '';

            const phone =
                doctor.phoneNumber?.toLowerCase() || '';

            const specialty =
                doctor.specialty?.toLowerCase() || '';

            const doctorId =
                String(doctor.id).toLowerCase();

            return (
                firstName.includes(query) ||
                lastName.includes(query) ||
                otherNames.includes(query) ||
                email.includes(query) ||
                phone.includes(query) ||
                specialty.includes(query) ||
                doctorId.includes(query)
            );
        });

        renderDoctors(filteredDoctors);
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

        if (result.patients) {
        const patients = result.patients;
            
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
// FETCH DOCTORS
// ========================================

async function fetchDoctors() {
    try {
        console.log('🔍 Fetching doctors...');

        const result = await apiRequest('/doctors', 'GET');

        console.log('📦 Doctors API response:', result);

        const doctors = result.doctors || [];

        allDoctors = doctors;

        updateDoctorStats(doctors);
        renderDoctors(doctors);

        // Update doctor count in header
        const doctorCount = document.getElementById('doctorCount');

        if (doctorCount) {
            doctorCount.textContent =
                `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} registered`;
        }

        // Update sidebar badge
        const doctorBadge = document.getElementById('alldoctorsBadge');

        if (doctorBadge) {
            doctorBadge.textContent = doctors.length;
        }

    } catch (error) {

        console.error('❌ Fetch doctors error:', error);

        const loading = document.getElementById('doctorLoading');

        if (loading) {
            loading.innerHTML = `
                <i class="fas fa-exclamation-circle"
                   style="font-size: 40px; color: var(--danger);"></i>

                <p style="margin-top: 12px;">
                    Failed to load doctors.
                </p>

                <button
                    onclick="fetchDoctors()"
                    style="
                        margin-top: 12px;
                        padding: 8px 24px;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                    ">
                    Retry
                </button>
            `;
        }

        showToast(
            'Failed to load doctors: ' + error.message,
            'error'
        );
    }
}
// ========================================
// UPDATE STATS
// ========================================

// function updateStats(patients) {
//     const total = patients.length;
//     const active = patients.filter(p => p.user?.isEmailVerified === true && !p.deletedAt).length;
//     const pending = patients.filter(p => p.user?.isEmailVerified === false && !p.deletedAt).length;
//     const inactive = patients.filter(p => p.deletedAt !== null).length;

//     const totalEl = document.getElementById('totalPatients');
//     const activeEl = document.getElementById('activePatients');
//     const pendingEl = document.getElementById('pendingPatients');
//     const inactiveEl = document.getElementById('inactivePatients');

//     if (totalEl) totalEl.textContent = total;
//     if (activeEl) activeEl.textContent = active;
//     if (pendingEl) pendingEl.textContent = pending;
//     if (inactiveEl) inactiveEl.textContent = inactive;
// }


// ========================================
// UPDATE DOCTOR STATS
// ========================================

function updateDoctorStats(doctors) {

    const total = doctors.length;

    const active = doctors.filter(
        doctor => doctor.deletedAt === null
    ).length;

    const inactive = doctors.filter(
        doctor => doctor.deletedAt !== null
    ).length;

    const totalEl = document.getElementById('totalDoctors');
    const activeEl = document.getElementById('activeDoctors');
    const inactiveEl = document.getElementById('inactiveDoctors');

    if (totalEl) {
        totalEl.textContent = total;
    }

    if (activeEl) {
        activeEl.textContent = active;
    }

    if (inactiveEl) {
        inactiveEl.textContent = inactive;
    }
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

    if (window.location.pathname.includes('sa_dashboard.html')) {
        fetchDashboardStats();
    }
    
    // Fetch patients if on patients page
    if (window.location.pathname.includes('sa_patients.html')) {
        fetchPatients();
    }

    if (window.location.pathname.includes('sa_doctors.html')) {
    fetchDoctors();
}
});

// ========================================
// RENDER DOCTORS
// ========================================

// ========================================
// RENDER DOCTORS
// ========================================

function renderDoctors(doctors) {

    const container = document.getElementById('doctorCards');
    const loading = document.getElementById('doctorLoading');
    const empty = document.getElementById('doctorEmpty');

    if (!container) {
        console.error('❌ doctorCards container not found');
        return;
    }

    // Hide loading
    if (loading) {
        loading.style.display = 'none';
    }

    // Clear previous cards
    container.innerHTML = '';

    // No doctors
    if (!doctors || doctors.length === 0) {

        if (empty) {
            empty.style.display = 'block';
        }

        return;
    }

    if (empty) {
        empty.style.display = 'none';
    }

    // Create cards
    doctors.forEach(doctor => {

        const firstName = doctor.user?.firstName || '';
        const lastName = doctor.user?.lastName || '';
        const otherNames = doctor.user?.otherNames || '';

        const fullName =
            `${firstName} ${lastName}`.trim() || 'Unknown Doctor';

        const initials =
            `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase() || 'DR';

        const email =
            doctor.user?.email || 'N/A';

        const phone =
            doctor.phoneNumber || 'N/A';

        const specialty =
            doctor.specialty || 'N/A';

        const experience =
            doctor.yearsOfExperience ?? 0;

        const status =
            doctor.deletedAt === null
                ? 'Active'
                : 'Inactive';

        const statusClass =
            doctor.deletedAt === null
                ? 'active'
                : 'inactive';

        const card = document.createElement('div');

        card.className = 'doctor-card';

        card.innerHTML = `

            <div class="header">

                <div class="avatar">
                    ${initials}
                </div>

                <div class="info">

                    <div class="name">
                        Dr. ${fullName}
                    </div>

                    <div class="specialty">
                        ${specialty}
                        · ID: DOC-${String(doctor.id).padStart(3, '0')}
                    </div>

                </div>

                <span class="status-badge ${statusClass}">
                    ${status}
                </span>

            </div>


            <div class="details">

                <div class="item">

                    <span class="label">
                        Email
                    </span>

                    <span class="value">
                        ${email}
                    </span>

                </div>


                <div class="item">

                    <span class="label">
                        Phone
                    </span>

                    <span class="value">
                        ${phone}
                    </span>

                </div>


                <div class="item">

                    <span class="label">
                        Specialty
                    </span>

                    <span class="value">
                        ${specialty}
                    </span>

                </div>


                <div class="item">

                    <span class="label">
                        Experience
                    </span>

                    <span class="value">
                        ${experience} year${experience !== 1 ? 's' : ''}
                    </span>

                </div>

            </div>


            <div class="actions">

                <button
                    class="btn-view"
                    onclick="viewDoctor(${doctor.id})">
                    <i class="fas fa-eye"></i>
                    View
                </button>

                <button
                    class="btn-edit"
                    onclick="editDoctor(${doctor.id})">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>


                <button
                    class="btn-toggle"
                    onclick="toggleDoctor(${doctor.id})">

                    <i class="fas fa-power-off"></i>
                    Toggle

                </button>


                <button
                    class="btn-delete"
                    onclick="deleteDoctor(${doctor.id})">

                    <i class="fas fa-trash"></i>
                    Delete

                </button>

            </div>

        `;

        container.appendChild(card);
    });
}
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
// VIEW DOCTOR
// ========================================

async function viewDoctor(id) {

    try {

        console.log(`🔍 Fetching doctor #${id}...`);

        const result = await apiRequest(`/doctors/${id}`, 'GET');

        console.log('📦 Doctor details:', result);

        const doctor = result.doctor || result.data;

        if (!doctor) {
            throw new Error('Doctor information not found.');
        }

        const firstName = doctor.user?.firstName || '';
        const lastName = doctor.user?.lastName || '';
        const otherNames = doctor.user?.otherNames || '';

        const fullName =
            `${firstName} ${otherNames} ${lastName}`
                .replace(/\s+/g, ' ')
                .trim();

        showDoctorModal(doctor, fullName);

    } catch (error) {

        console.error('❌ View doctor error:', error);

        showToast(
            'Failed to load doctor: ' + error.message,
            'error'
        );
    }
}

// ========================================
// SHOW DOCTOR MODAL
// ========================================

function showDoctorModal(doctor, fullName) {

    const modal = document.getElementById('doctorModal');

    if (!modal) return;

    const firstName =
        doctor.user?.firstName || '';

    const lastName =
        doctor.user?.lastName || '';

    const initials =
        `${firstName.charAt(0)}${lastName.charAt(0)}`
            .toUpperCase() || 'DR';


    document.getElementById('modalDoctorAvatar')
        .textContent = initials;

    document.getElementById('modalDoctorName')
        .textContent = `Dr. ${fullName}`;

    document.getElementById('modalDoctorSpecialty')
        .textContent = doctor.specialty || 'N/A';

    document.getElementById('modalDoctorId')
        .textContent =
        `DOC-${String(doctor.id).padStart(3, '0')}`;

    document.getElementById('modalDoctorEmail')
        .textContent =
        doctor.user?.email || 'N/A';

    document.getElementById('modalDoctorPhone')
        .textContent =
        doctor.phoneNumber || 'N/A';

    document.getElementById('modalDoctorGender')
        .textContent =
        doctor.gender || 'N/A';

    document.getElementById('modalDoctorDOB')
        .textContent =
        doctor.dateOfBirth
            ? new Date(doctor.dateOfBirth)
                .toLocaleDateString()
            : 'N/A';

    document.getElementById('modalDoctorExperience')
        .textContent =
        `${doctor.yearsOfExperience ?? 0} year${
            doctor.yearsOfExperience === 1 ? '' : 's'
        }`;

    document.getElementById('modalDoctorEmailStatus')
        .textContent =
        doctor.user?.isEmailVerified
            ? 'Verified'
            : 'Not Verified';

    document.getElementById('modalDoctorStatus')
        .textContent =
        doctor.deletedAt === null
            ? 'Active'
            : 'Inactive';

    document.getElementById('modalDoctorBio')
        .textContent =
        doctor.bio || 'No biography available.';


    modal.classList.add('open');
}

// ========================================
// CLOSE DOCTOR MODAL
// ========================================

function closeDoctorModal() {

    const modal =
        document.getElementById('doctorModal');

    if (modal) {
        modal.classList.remove('open');
    }
}

document.addEventListener('click', function(e) {

    const modal =
        document.getElementById('doctorModal');

    if (
        modal &&
        e.target === modal
    ) {
        closeDoctorModal();
    }

});

document.addEventListener('keydown', function(e) {

    if (e.key === 'Escape') {
        closeDoctorModal();
    }

});

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

async function fetchDashboardStats() {
    try {
        const result = await apiRequest('/reports/stats', 'GET');
        const stats = result.data || {};
        const values = {
            totalDoctors: stats.doctors?.total ?? 0,
            totalPatients: stats.patients?.total ?? 0,
            todayAppointments: stats.appointments?.today ?? 0,
            totalAdmins: stats.admins?.total ?? 0,
            pendingAppointments: stats.appointments?.pending ?? 0,
            totalAppointments: stats.appointments?.total ?? 0,
        };

        Object.entries(values).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        showToast('Failed to load dashboard statistics', 'error');
    }
}