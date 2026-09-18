const API_BASE_URL = 'https://smart-hospital-fet1.onrender.com';
const FRONTEND_URL = 'http://localhost:5500';

function redirectToLogin() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// AUTHENTICATION

async function checkAuth() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        redirectToLogin();
        return false;
    }

    try {
        const result = await apiRequest('/auth/me', 'GET');
        const user = result?.data?.user || result?.data || result?.user;
        const role = String(user?.role || '').toUpperCase();

        if (!user || !['DOCTOR', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
            redirectToLogin();
            return false;
        }

        localStorage.setItem('user', JSON.stringify({
            ...(JSON.parse(localStorage.getItem('user') || '{}')),
            ...user,
        }));

        return true;
    } catch (error) {
        console.error('Doctor auth check failed:', error);
        redirectToLogin();
        return false;
    }
}

function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// API REQUEST

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;

    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);

        const result = await response.json();

        if (response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
            throw new Error('Authentication required. Please log in.');
        }

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
    const currentPage = window.location.pathname.split('/').pop() || 'doctor-dashboard.html';
    
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

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

async function loadDoctorProfile() {
    const result = await apiRequest("/doctors/me", "GET");

    if (!result.success) {
        throw new Error(result.message || "Could not load doctor profile");
    }

    const doctor = result.data;
    const user = doctor.user || {};

    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `Dr. ${firstName} ${lastName}`.trim() || "Doctor";
    const initials = `${firstName[0] || ""}${lastName[0] || ""}` || "DR";

    // Keep user details available for all doctor pages.
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

    localStorage.setItem("user", JSON.stringify({
        ...savedUser,
        ...user,
        doctorId: doctor.id,
        specialty: doctor.specialty || "",
    }));

    // Dashboard header and sidebar
    const sidebarName = document.getElementById("sidebarName");
    const sidebarAvatar = document.getElementById("sidebarAvatar");
    const topbarAvatar = document.getElementById("topbarAvatar");
    const sidebarRole = document.querySelector(".sidebar-footer .role");

    if (sidebarName) sidebarName.textContent = fullName;
    if (sidebarAvatar) sidebarAvatar.textContent = initials;
    if (topbarAvatar) topbarAvatar.textContent = initials;
    if (sidebarRole) sidebarRole.textContent = doctor.specialty || "Doctor";
}

function getAppointmentStatus(appointment) {
    return String(appointment.status || "pending").toLowerCase();
}

function getPatientName(appointment) {
    const user = appointment.patient?.user || {};

    return `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown patient";
}

function isToday(dateValue) {
    if (!dateValue) return false;

    const date = new Date(dateValue);
    const today = new Date();

    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

function formatTime(dateValue) {
    if (!dateValue) return "Time not set";

    return new Date(dateValue).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getCardByTitle(title) {
    return [...document.querySelectorAll(".card")].find((card) =>
        card.querySelector("h3")?.textContent.includes(title)
    );
}

function createScheduleItem(appointment) {
    const item = document.createElement("div");
    item.className = "schedule-item";

    const status = getAppointmentStatus(appointment);
    const name = getPatientName(appointment);
    const details = [
        appointment.type || "Appointment",
        appointment.symptoms,
        status === "completed" ? "Completed" : null,
    ].filter(Boolean).join(" · ");

    const time = document.createElement("span");
    time.className = "time";
    time.textContent = formatTime(appointment.scheduledAt);

    const statusDot = document.createElement("span");
    statusDot.className = `status-dot ${status}`;

    const info = document.createElement("div");
    info.className = "info";

    const patientName = document.createElement("div");
    patientName.className = "name";
    patientName.textContent = name;

    const type = document.createElement("div");
    type.className = "type";
    type.textContent = details;

    info.append(patientName, type);
    item.append(time, statusDot, info);

    return item;
}

function renderTodaySchedule(appointments) {
    const scheduleCard = getCardByTitle("Today's Schedule");
    if (!scheduleCard) return;

    scheduleCard.querySelectorAll(".schedule-item, .queue-item").forEach((el) => el.remove());

    const header = scheduleCard.querySelector(".card-header");

    // Sort by time, earliest first
    const sorted = [...appointments].sort(
        (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
    );

    if (sorted.length === 0) {
        const empty = document.createElement("div");
        empty.className = "schedule-item";
        empty.textContent = "No appointments scheduled for today.";
        header.after(empty);
        return;
    }

    sorted.forEach((appointment) => {
        const item = document.createElement("div");
        item.className = "schedule-item";

        const time = document.createElement("span");
        time.className = "time";
        time.textContent = formatTime(appointment.scheduledAt);

        const statusDot = document.createElement("span");
        statusDot.className = `status-dot ${getAppointmentStatus(appointment)}`;

        const info = document.createElement("div");
        info.className = "info";

        const title = document.createElement("div");
        title.className = "name";
        title.textContent = `Appointment for ${getPatientName(appointment)}`;

        const type = document.createElement("div");
        type.className = "type";
        type.textContent = getAppointmentType(appointment);

        info.append(title, type);
        item.append(time, statusDot, info);

        header.after(item);
    });
}

function countPrescriptionsToday(prescriptions) {
    return prescriptions.filter((p) => isToday(p.createdAt)).length;
}

function renderPatientsSeenToday(prescriptions) {
    const el = document.getElementById("patientsSeenToday");
    if (el) el.textContent = countPrescriptionsToday(prescriptions);
}

function renderNextPatient(todayAppointments) {
    const el = document.getElementById("nextPatientName");
    if (!el) return;

    const next = [...todayAppointments]
        .filter((a) =>
            ["pending", "confirmed", "scheduled"].includes(getAppointmentStatus(a))
        )
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))[0];

    el.textContent = next
        ? `${getPatientName(next)} · ${formatTime(next.scheduledAt)}`
        : "No patient waiting";
}

function renderPatientQueue(appointments) {
    const queueCard = getCardByTitle("Patient Queue");
    if (!queueCard) return;

    // Today's queue = still-active statuses
    const waitingAppointments = appointments.filter((a) =>
        ["pending", "confirmed", "scheduled"].includes(getAppointmentStatus(a))
    );

    // Clean out old items
    queueCard.querySelectorAll(".queue-item, .schedule-item").forEach((el) => el.remove());

    // Update count in the header
    const queueCount =
        document.getElementById("queueCount") ||
        queueCard.querySelector(".card-header span");
    if (queueCount) {
        queueCount.textContent = `${waitingAppointments.length} patient${
            waitingAppointments.length === 1 ? "" : "s"
        } waiting`;
    }

    const header = queueCard.querySelector(".card-header");

    if (waitingAppointments.length === 0) {
        const empty = document.createElement("div");
        empty.className = "schedule-item";
        empty.textContent = "No patients waiting today.";
        header.after(empty);
        return;
    }

    // Sort by scheduled time (earliest first)
    [...waitingAppointments]
        .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
        .forEach((appointment) => {
            const item = document.createElement("div");
            item.className = "queue-item";

            const left = document.createElement("div");
            left.className = "left";

            const priority = document.createElement("span");
            priority.className = "priority";

            const info = document.createElement("div");
            info.className = "info";

            const name = document.createElement("div");
            name.className = "name";
            name.textContent = getPatientName(appointment);

            const details = document.createElement("div");
            details.className = "details";
            details.textContent = getAppointmentType(appointment);

            info.append(name, details);
            left.append(priority, info);

            const right = document.createElement("div");
            right.className = "right";

            const waitTime = document.createElement("span");
            waitTime.className = "wait-time";
            waitTime.textContent = `⏱️ ${formatTime(appointment.scheduledAt)}`;

            const startButton = document.createElement("button");
            startButton.className = "start-btn";
            startButton.textContent = "Start";
            startButton.addEventListener("click", () => {
                window.location.href = "doc_allappointments.html";
            });

            right.append(waitTime, startButton);
            item.append(left, right);

            header.after(item);
        });
}

function updateDashboardStats(appointments, prescriptions) {
    const setText = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    // Big stat cards
    setText("statTotalAppointments", appointments.length);
    setText("statTotalPrescriptions", prescriptions.length);

    // Quick stats
    setText("quickTotalAppointments", appointments.length);
    setText("quickTotalPrescriptions", prescriptions.length);

    // Sidebar badges
    const appointmentsBadge = document.getElementById("appointmentsBadge");
    if (appointmentsBadge) {
        appointmentsBadge.textContent = appointments.length;
        appointmentsBadge.style.display = appointments.length ? "" : "none";
    }

    const allAppointmentsBadge = document.getElementById("allAppointmentsBadge");
    if (allAppointmentsBadge) {
        allAppointmentsBadge.textContent = appointments.length;
        allAppointmentsBadge.style.display = appointments.length ? "" : "none";
    }

    const prescriptionsBadge = document.getElementById("prescriptionsSidebarBadge");
    if (prescriptionsBadge) {
        prescriptionsBadge.textContent = prescriptions.length;
        prescriptionsBadge.style.display = prescriptions.length ? "" : "none";
    }
}

async function loadDoctorDashboard() {
    const result = await apiRequest("/appointments/doctor/me", "GET");

    if (!result.success) {
        throw new Error(result.message || "Could not load appointments");
    }

    const appointments = result.data || [];
    const todayAppointments = appointments.filter((a) => isToday(a.scheduledAt));

    const prescriptions = await loadDoctorPrescriptions();

    // Stats (all-time)
    updateDashboardStats(appointments, prescriptions);

    // Today-only widgets
    renderPatientQueue(todayAppointments);
    renderTodaySchedule(todayAppointments);

    // Blue card widgets
    renderPatientsSeenToday(prescriptions);
    renderNextPatient(todayAppointments);
}

function getAppointmentType(appointment) {
    return appointment.type || appointment.symptoms || 'General Consultation';
}
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
            const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'DS';

            const nameEl = document.getElementById('sidebarName');
            const avatarEl = document.getElementById('sidebarAvatar');
            const topbarAvatar = document.getElementById('topbarAvatar');
            
            if (nameEl) {
                nameEl.textContent = `Dr. ${user.lastName }`;
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
    const statusSwitch = document.getElementById('statusSwitch');
    const toggleTrack = document.getElementById('toggleTrack');
    const statusBadge = document.getElementById('statusBadge');

    if (!statusToggle) return;

    function toggleStatus() {
        isOnline = !isOnline;

        if (isOnline) {
            if (statusIndicator) {
                statusIndicator.className = 'indicator online';
                statusText.textContent = 'Online';
            }
            if (statusSwitch) statusSwitch.className = 'status-switch active';
            if (toggleTrack) toggleTrack.className = 'toggle-track active';
            if (statusBadge) {
                statusBadge.className = 'status-badge online';
                statusBadge.textContent = 'Online';
            }
            showToast('You are now ONLINE and available for consultations', 'success');
        } else {
            if (statusIndicator) {
                statusIndicator.className = 'indicator offline';
                statusText.textContent = 'Offline';
            }
            if (statusSwitch) statusSwitch.className = 'status-switch inactive';
            if (toggleTrack) toggleTrack.className = 'toggle-track';
            if (statusBadge) {
                statusBadge.className = 'status-badge offline';
                statusBadge.textContent = 'Offline';
            }
            showToast('You are now OFFLINE. Patients will be notified.', 'warning');
        }
    }

    // Click on toggle track
    if (toggleTrack) toggleTrack.addEventListener('click', toggleStatus);

    // Click on the status badge area
    if (statusToggle) statusToggle.addEventListener('click', toggleStatus);
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
        // This can be extended to filter content
    });
}

async function loadDoctorPrescriptions() {
    try {
        const result = await apiRequest('/prescriptions/doctor/me', 'GET');
        return result.data || [];
    } catch (error) {
        console.error('Failed to load prescriptions:', error);
        return []; // Don't break the dashboard if this fails
    }
}

// const DOCTOR_API_BASE_URL = 'http://localhost:5001';

// async function doctorApiRequest(endpoint, method = 'GET', data = null) {
//     const token = localStorage.getItem('access_token');
//     const options = {
//         method,
//         credentials: 'include',
//         headers: {
//             'Content-Type': 'application/json',
//             ...(token ? { Authorization: `Bearer ${token}` } : {})
//         }
//     };

//     if (data) options.body = JSON.stringify(data);

//     const response = await fetch(`${DOCTOR_API_BASE_URL}${endpoint}`, options);
//     const result = await response.json().catch(() => ({}));

//     if (!response.ok) {
//         throw new Error(result.message || `Request failed (${response.status})`);
//     }

//     return result;
// }

// function appointmentPatient(appointment) {
//     return appointment.patient?.user || {};
// }

// function patientName(appointment) {
//     const patient = appointmentPatient(appointment);
//     return `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown patient';
// }

// function appointmentTime(appointment) {
//     if (!appointment.scheduledAt) return 'Time not set';
//     return new Date(appointment.scheduledAt).toLocaleString([], {
//         dateStyle: 'medium',
//         timeStyle: 'short'
//     });
// }

// function appointmentStatus(appointment) {
//     return String(appointment.status || 'pending').toLowerCase();
// }

// function renderDoctorAppointments(appointments) {
//     const items = document.querySelectorAll('.schedule-item');
//     items.forEach(item => item.remove());

//     const scheduleCard = [...document.querySelectorAll('.card')].find(card =>
//         card.textContent.includes("Today's Schedule") || card.textContent.includes('Full Schedule')
//     );
//     if (!scheduleCard) return;

//     const header = scheduleCard.querySelector('.card-header');
//     appointments.forEach(appointment => {
//         const item = document.createElement('div');
//         const status = appointmentStatus(appointment);
//         item.className = 'schedule-item';
//         item.innerHTML = `
//             <span class="time">${appointmentTime(appointment)}</span>
//             <span class="status-dot ${status}"></span>
//             <div class="info">
//                 <div class="name">${patientName(appointment)}</div>
//                 <div class="type">${appointment.type || 'Appointment'}${appointment.symptoms ? ` · ${appointment.symptoms}` : ''}</div>
//             </div>
//             <span style="font-size: 12px; color: var(--gray-500);">${status}</span>
//         `;
//         header.after(item);
//     });

//     if (!appointments.length) {
//         const empty = document.createElement('div');
//         empty.className = 'schedule-item';
//         empty.textContent = 'No appointments found.';
//         header.after(empty);
//     }
// }

// function renderAllDoctorAppointments(appointments) {
//     const cards = document.querySelectorAll('.appointment-card');
//     const container = cards[0]?.parentElement;
//     cards.forEach(card => card.remove());
//     if (!container) return;

//     appointments.forEach(appointment => {
//         const card = document.createElement('div');
//         const status = appointmentStatus(appointment);
//         card.className = `appointment-card ${status}`;
//         card.innerHTML = `
//             <div><strong>${patientName(appointment)}</strong></div>
//             <div>${appointmentTime(appointment)}</div>
//             <div>${appointment.type || 'Appointment'}${appointment.symptoms ? ` · ${appointment.symptoms}` : ''}</div>
//             <span class="status-badge ${status}">${status}</span>
//         `;
//         container.appendChild(card);
//     });
// }

// function renderDoctorPatients(appointments) {
//     const patients = [...new Map(appointments.map(appointment => {
//         const patient = appointment.patient;
//         return [patient?.id, patient];
//     }).filter(([id, patient]) => id && patient)).values()];

//     const grid = document.querySelector('main .main-content > div, main > div[style*="grid-template-columns"]');
//     if (!grid) return;
//     const cards = grid.querySelectorAll('.card');
//     cards.forEach(card => card.remove());

//     patients.forEach(patient => {
//         const user = patient.user || {};
//         const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown patient';
//         const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` || 'PT';
//         const card = document.createElement('div');
//         card.className = 'card';
//         card.innerHTML = `<div style="display:flex;align-items:center;gap:16px;"><div style="width:50px;height:50px;border-radius:50%;background:var(--primary-lighter);color:white;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;">${initials}</div><div><div style="font-weight:600;font-size:16px;">${name}</div><div style="font-size:13px;color:var(--gray-500);">Patient #${patient.id} · ${user.email || 'No email'}</div></div></div>`;
//         grid.appendChild(card);
//     });
// }

// function updateDoctorAppointmentStats(appointments) {
//     const counts = {
//         total: appointments.length,
//         pending: appointments.filter(item => appointmentStatus(item) === 'pending').length,
//         confirmed: appointments.filter(item => appointmentStatus(item) === 'confirmed').length,
//         cancelled: appointments.filter(item => appointmentStatus(item) === 'cancelled').length
//     };

//     document.querySelectorAll('.stat-card .number').forEach((element, index) => {
//         const values = [counts.total, counts.pending, counts.confirmed, counts.cancelled];
//         if (values[index] !== undefined) element.textContent = values[index];
//     });
// }

// async function loadDoctorData() {
//     try {
//         if (window.location.pathname.split('/').pop() === 'doc_profile.html') {
//             const profileResult = await doctorApiRequest('/doctors/me');
//             const doctor = profileResult.data;
//             const user = doctor.user || {};
//             const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Doctor';
//             const values = {
//                 'Full Name': fullName,
//                 Email: user.email || 'Not provided',
//                 Phone: doctor.phoneNumber || 'Not provided',
//                 Department: doctor.specialty || 'Not provided',
//                 Specialization: doctor.specialty || 'Not provided',
//                 'Years Experience': doctor.yearsOfExperience == null ? 'Not provided' : `${doctor.yearsOfExperience} years`
//             };
//             document.querySelectorAll('.quick-stat').forEach(row => {
//                 const label = row.querySelector('.label')?.textContent.trim();
//                 const value = row.querySelector('.value');
//                 if (value && values[label] !== undefined) value.textContent = values[label];
//             });
//             return;
//         }

//         const result = await doctorApiRequest('/appointments/doctor/me');
//         const appointments = result.data || [];
//         const page = window.location.pathname.split('/').pop();

//         updateDoctorAppointmentStats(appointments);

//         if (page === 'doc_dashboard.html') {
//             const today = new Date().toDateString();
//             const todayAppointments = appointments.filter(item => item.scheduledAt && new Date(item.scheduledAt).toDateString() === today);
//             renderDoctorAppointments(todayAppointments);
//         } else if (page === 'doc_schedule.html') {
//             renderDoctorAppointments(appointments);
//         } else if (page === 'doc_allappointments.html') {
//             renderAllDoctorAppointments(appointments);
//         } else if (page === 'doc_mypatients.html') {
//             renderDoctorPatients(appointments);
//         }
//     } catch (error) {
//         console.error('Failed to load doctor data:', error);
//         showToast(`Failed to load doctor data: ${error.message}`, 'error');
//     }
// }

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
    if (!(await checkAuth())) return;

    loadUserData();
    highlightActivePage();
    initStatusToggle();
    initSearch();

    try {
        await Promise.all([
            loadDoctorProfile(),
            loadDoctorDashboard(),
        ]);
    } catch (error) {
        console.error("Failed to load dashboard:", error);
        showToast(error.message || "Failed to load dashboard data", "error");
    }
});