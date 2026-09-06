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
                nameEl.textContent = user.name || 'Super Admin';
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
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    highlightActivePage();
    initStatusToggle();
    initSearch();
});