
// CONFIGURATION
const API_BASE_URL = 'https://smart-hospital-fet1.onrender.com';
const FRONTEND_URL = 'http://localhost:5500';

// AUTHENTICATION

function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'login.html';
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

// TOAST NOTIFICATIONS

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

// SIDEBAR FUNCTIONALITY

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

function initSidebar() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const appointmentsToggle = document.getElementById('appointmentsToggle');
    const appointmentsMenu = document.getElementById('appointmentsMenu');

    // Toggle sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Close sidebar on overlay click (mobile)
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
            }
        });
    }

    // Close sidebar on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && window.innerWidth <= 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        }
    });

    // Close sidebar on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.getElementById('sidebar').classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        }
    });

    // Appointments dropdown
    if (appointmentsToggle && appointmentsMenu) {
        appointmentsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
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
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// HIGHLIGHT ACTIVE PAGE

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    
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

// LOAD USER DATA

function loadUserData() {
    const userStr = localStorage.getItem('user');
    
    if (userStr) {
        try {
            const user = JSON.parse(userStr);
            const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '') || 'U';

            const nameEl = document.getElementById('sidebarName');
            const avatarEl = document.getElementById('sidebarAvatar');
            const topbarAvatar = document.getElementById('topbarAvatar');
            const profileAvatar = document.getElementById('profileAvatar');
            
            if (nameEl) {
                nameEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
            }
            if (avatarEl) avatarEl.textContent = initials;
            if (topbarAvatar) topbarAvatar.textContent = initials;
            if (profileAvatar) profileAvatar.textContent = initials;

            const patientName = document.getElementById('patientName');
            const patientEmail = document.getElementById('patientEmail');
            
            if (patientName) {
                patientName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim();
            }
            if (patientEmail && user.email) {
                patientEmail.textContent = user.email;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }
}


// HEART RATE CHART

function initHeartRateChart() {
    const ctx = document.getElementById('heartRateChart');
    if (!ctx) return;
    
    const chartCtx = ctx.getContext('2d');

    new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'This Week',
                data: [72, 78, 75, 82, 79, 85, 80],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#3b82f6',
            }, {
                label: 'Last Week',
                data: [68, 70, 73, 76, 72, 78, 74],
                borderColor: '#22c55e',
                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#22c55e',
                borderDash: [5, 5],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    cornerRadius: 8,
                    padding: 12,
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 11 }, color: '#94a3b8' }
                },
                y: {
                    beginAtZero: false,
                    min: 30,
                    max: 100,
                    grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
                    ticks: { font: { size: 11 }, color: '#94a3b8', stepSize: 20 }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        }
    });

    // Update stats from chart data
    const data = [72, 78, 75, 82, 79, 85, 80];
    const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);
    const min = Math.min(...data);
    const max = Math.max(...data);

    const avgEl = document.getElementById('avgHeartRate');
    const minEl = document.getElementById('minHeartRate');
    const maxEl = document.getElementById('maxHeartRate');
    
    if (avgEl) avgEl.textContent = `${avg} bpm`;
    if (minEl) minEl.textContent = `${min} bpm`;
    if (maxEl) maxEl.textContent = `${max} bpm`;
}

// SEARCH

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            console.log('Searching for:', query);
        });
    }
}

// PAGE-SPECIFIC INITIALIZATION

function initPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    
    // Initialize chart only on dashboard
    if (currentPage === 'dashboard.html' || currentPage === '') {
        if (document.getElementById('heartRateChart')) {
            initHeartRateChart();
        }
    }
    
    // Dashboard specific: show welcome toast
    if (currentPage === 'dashboard.html' || currentPage === '') {
        setTimeout(() => {
            showToast('Welcome to your dashboard!', 'info');
        }, 500);
    }
}

// INITIALIZATION

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadUserData();
    highlightActivePage();
    initSidebar();
    initSearch();
    initPage();
});