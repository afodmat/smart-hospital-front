// CONFIGURATION
const API_BASE_URL = 'http://localhost:5001'; 

// UTILITY FUNCTIONS
function showAlert(elementId, message, type = 'success') {
    const alert = document.getElementById(elementId);
    if (!alert) return;
    
    alert.textContent = message;
    alert.className = `alert alert-${type} visible`;
    
    // Auto-hide after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            alert.classList.remove('visible');
        }, 5000);
    }
}

function hideAlert(elementId) {
    const alert = document.getElementById(elementId);
    if (alert) {
        alert.classList.remove('visible');
    }
}

function setLoading(buttonId, loading = true) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    
    if (loading) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Loading...`;
    } else {
        btn.disabled = false;
        btn.innerHTML = btn.dataset.originalText || 'Submit';
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^\+?[\d\s-]{10,}$/.test(phone);
}

function validatePassword(password) {
    return password.length >= 8;
}

function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add('input-error');
    if (error) {
        error.textContent = message;
        error.classList.add('visible');
    }
}

function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove('input-error');
    if (error) error.classList.remove('visible');
}

// AUTH API CALLS
async function apiRequest(endpoint, method = 'POST', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || `HTTP error ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// REGISTRATION
async function handleRegister(event) {
    event.preventDefault();
    hideAlert('register-alert');
    
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const otherNames = document.getElementById('otherNames').value.trim();
    const email = document.getElementById('email').value.trim();
    // const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    // const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    let isValid = true;
    
    if (!firstName || firstName.length < 2) {
        showFieldError('firstName', 'firstName-error', 'Full name is required (min 2 characters)');
        isValid = false;
    } else {
        clearFieldError('firstName', 'firstName-error');
    }
    if (!lastName || lastName.length < 2) {
        showFieldError('lastName', 'lastName-error', 'Full name is required (min 2 characters)');
        isValid = false;
    } else {
        clearFieldError('lastName', 'lastName-error');
    }
    if (!otherNames || otherNames.length < 2) {
        showFieldError('otherNames', 'otherNames-error', 'Full name is required (min 2 characters)');
        isValid = false;
    } else {
        clearFieldError('otherNames', 'otherNames-error');
    }
    
    if (!email || !validateEmail(email)) {
        showFieldError('email', 'email-error', 'Please enter a valid email address');
        isValid = false;
    } else {
        clearFieldError('email', 'email-error');
    }
    
    // if (!phone || !validatePhone(phone)) {
    //     showFieldError('phone', 'phone-error', 'Please enter a valid phone number');
    //     isValid = false;
    // } else {
    //     clearFieldError('phone', 'phone-error');
    // }
    
    if (!password || !validatePassword(password)) {
        showFieldError('password', 'password-error', 'Password must be at least 8 characters');
        isValid = false;
    } else {
        clearFieldError('password', 'password-error');
    }
    
    // if (password !== confirmPassword) {
    //     showFieldError('confirmPassword', 'confirmPassword-error', 'Passwords do not match');
    //     isValid = false;
    // } else {
    //     clearFieldError('confirmPassword', 'confirmPassword-error');
    // }
    
    if (!isValid) return;
    
    setLoading('register-btn', true);
    
    try {
        const result = await apiRequest('/auth/register', 'POST', {
            firstName: firstName,
            lastName: lastName,
            otherNames: otherNames,
            email,
            // phone_number: phone,
            password,
        });
        
        // showAlert('register-alert', result.message || 'Registration successful! Please log in.', 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        showAlert('register-alert', error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        setLoading('register-btn', false);
    }
}

// LOGIN
async function handleLogin(event) {
    event.preventDefault();
    hideAlert('login-alert');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validation
    let isValid = true;
    
    if (!email || !validateEmail(email)) {
        showFieldError('email', 'email-error', 'Please enter a valid email');
        isValid = false;
    } else {
        clearFieldError('email', 'email-error');
    }
    
    if (!password || password.length < 8) {
        showFieldError('password', 'password-error', 'Password must be at least 8 characters');
        isValid = false;
    } else {
        clearFieldError('password', 'password-error');
    }
    
    if (!isValid) return;
    
    setLoading('login-btn', true);
    
    try {
        const result = await apiRequest('/auth/login', 'POST', {
            email,
            password,
        });
        
        // Store tokens
        localStorage.setItem('access_token', result.accessToken);
        localStorage.setItem('user', JSON.stringify(result.user));
        
        showAlert('login-alert', 'Login successful! Redirecting...', 'success');
        
        // Redirect to dashboard
        const dashboardUrl = `http://127.0.0.1:5500/smart_hospital_system/frontend/patient_dashboard.html`;
        setTimeout(() => {
            window.location.href = dashboardUrl;
        }, 1000);
        
    } catch (error) {
        showAlert('login-alert', error.message || 'Invalid email or password.', 'error');
    } finally {
        setLoading('login-btn', false);
    }
}

// FORGOT PASSWORD
async function handleForgotPassword(event) {
    event.preventDefault();
    hideAlert('reset-alert');
    
    const email = document.getElementById('email').value.trim();
    
    if (!email || !validateEmail(email)) {
        showFieldError('email', 'email-error', 'Please enter a valid email');
        return;
    } else {
        clearFieldError('email', 'email-error');
    }
    
    setLoading('reset-btn', true);
    
    try {
        const result = await apiRequest('/auth/forgot-password', 'POST', { email });
        
        showAlert('reset-alert', result.message || 'Password reset link sent to your email.', 'success');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
        
    } catch (error) {
        showAlert('reset-alert', error.message || 'Failed to send reset link. Please try again.', 'error');
    } finally {
        setLoading('reset-btn', false);
    }
}

// DASHBOARD
async function loadDashboard() {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
        window.location.href = 'patient_dashboard.html';
        return;
    }
    
    try {
        const user = JSON.parse(userData);
        
        // Display user info
        document.getElementById('FirstName').textContent = user.first_name || 'User';
        document.getElementById('lastName').textContent = user.last_name || 'User';
        document.getElementById('userEmail').textContent = user.email || '';
        document.getElementById('userAvatar').textContent = (user.full_name || 'U')[0].toUpperCase();
        
        // Try to fetch protected data to validate token
        await apiRequest('/auth/me', 'GET');
        
        // Dashboard stats (mock data - replace with real API calls)
        document.getElementById('statPatients').textContent = '0';
        document.getElementById('statHospitals').textContent = '0';
        document.getElementById('statMedicines').textContent = '0';
        document.getElementById('statAppointments').textContent = '0';
        
    } catch (error) {
        console.error('Dashboard load error:', error);
        // Token expired, redirect to login
        logout();
    }
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// TOGGLE PASSWORD VISIBILITY
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

// EVENT BINDINGS (Run when DOM is ready)
document.addEventListener('DOMContentLoaded', function() {
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Forgot password form
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handleForgotPassword);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Load dashboard if on dashboard page
    if (document.getElementById('dashboard-app')) {
        loadDashboard();
    }
    
    // Auto-clear field errors on input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function() {
            const errorId = this.id + '-error';
            const errorEl = document.getElementById(errorId);
            if (errorEl) {
                errorEl.classList.remove('visible');
                this.classList.remove('input-error');
            }
        });
    });
});