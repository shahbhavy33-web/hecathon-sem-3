const API_URL = 'http://localhost:5000';
const token = () => localStorage.getItem('token');
const authHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    headers.Authorization = 'Bearer ' + token();
    return headers;
};

function showMessage(message, isError = true) {
    const element = document.getElementById('auth-message');
    if (element) {
        element.textContent = message;
        element.style.color = isError ? 'var(--danger)' : 'var(--success)';
    }
}

async function readResponse(response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Something went wrong. Please try again.');
    return data;
}

document.querySelectorAll('[data-auth-view]').forEach(button => {
    button.addEventListener('click', () => {
        const view = button.dataset.authView;
        document.querySelectorAll('[data-auth-view]').forEach(item => item.classList.toggle('active', item === button));
        document.querySelectorAll('[data-form-view]').forEach(form => form.classList.toggle('hidden', form.dataset.formView !== view));
        showMessage('');
    });
});

document.getElementById('login-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
        const response = await fetch(`${API_URL}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ email:document.getElementById('login-email').value, password:document.getElementById('login-password').value }) });
        const data = await readResponse(response);
        localStorage.setItem('token', data.token); localStorage.setItem('userRole', data.role); localStorage.setItem('userName', data.name);
        window.location.href = 'dashboard.html';
    } catch (error) { showMessage(error.message); }
});

document.getElementById('register-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try {
        await readResponse(await fetch(`${API_URL}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ name:document.getElementById('register-name').value, email:document.getElementById('register-email').value, password:document.getElementById('register-password').value }) }));
        document.querySelector('[data-auth-view="login"]').click(); showMessage('Account created. You can now sign in.', false);
    } catch (error) { showMessage(error.message); }
});

document.querySelector('[data-action="logout"]')?.addEventListener('click', () => { localStorage.clear(); window.location.href = 'login.html'; });

document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
    const group = button.dataset.tabGroup; const tab = button.dataset.tab;
    document.querySelectorAll(`[data-tab-group="${group}"]`).forEach(item => item.classList.toggle('active', item === button));
    document.querySelectorAll(`[data-panel-group="${group}"]`).forEach(panel => panel.classList.toggle('hidden', panel.dataset.panel !== tab));
}));

async function loadAttendanceLogs() {
    const data = await readResponse(await fetch(`${API_URL}/attendance/my-logs`, { headers:authHeaders() }));
    const logs = data.logs || [];
    document.getElementById('attendance-log').innerHTML = logs.map(log => `<div><strong>${log.date}</strong> &mdash; ${log.status}</div>`).join('') || '<p class="muted">No records yet.</p>';
    document.getElementById('present-count').textContent = logs.filter(log => log.status === 'present').length;
}

document.getElementById('attendance-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try { await readResponse(await fetch(`${API_URL}/attendance/mark`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ status:document.getElementById('attendance-status').value }) })); await loadAttendanceLogs(); } catch (error) { alert(error.message); }
});
document.getElementById('leave-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try { await readResponse(await fetch(`${API_URL}/leave/apply`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ start_date:document.getElementById('leave-start').value, end_date:document.getElementById('leave-end').value, type:document.getElementById('leave-type').value }) })); event.target.reset(); document.getElementById('leave-log').innerHTML = '<p class="muted">Leave request submitted.</p>'; } catch (error) { alert(error.message); }
});
document.getElementById('payroll-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    try { await readResponse(await fetch(`${API_URL}/payroll/generate`, { method:'POST', headers:authHeaders(), body:JSON.stringify({ month:document.getElementById('payroll-month').value }) })); document.getElementById('payroll-status').textContent = 'Payroll generated successfully.'; } catch (error) { document.getElementById('payroll-status').textContent = error.message; }
});

async function loadDashboard() {
    if (!token()) { window.location.replace('login.html'); return; }
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    document.getElementById(isAdmin ? 'admin-dashboard' : 'employee-dashboard')?.classList.remove('hidden');
    document.getElementById('user-name').textContent = localStorage.getItem('userName') || '';
    try {
        if (isAdmin) {
            const data = await readResponse(await fetch(`${API_URL}/dashboard/metrics`, { headers:authHeaders() }));
            document.getElementById('total-employees').textContent = data.total_employees ?? 0; document.getElementById('today-attendance').textContent = data.today_attendance ?? 0; document.getElementById('pending-leaves').textContent = data.pending_leaves ?? 0;
        } else { await loadAttendanceLogs(); document.getElementById('leave-log').innerHTML = '<p class="muted">No leave requests yet.</p>'; }
    } catch (error) { console.error(error); }
}
if (document.body.classList.contains('dashboard-page')) loadDashboard();
