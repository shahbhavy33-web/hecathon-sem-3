# WorkZen HRMS — 5-Hour Hackathon Battle Plan

## Timeline Overview
- **Phase 1 (0:00–0:30):** Architecture & Database Schema → 30 min
- **Phase 2 (0:30–1:15):** Figma UI Design (5 key screens) → 45 min  
- **Phase 3 (1:15–5:00):** Backend + Frontend Build → 225 min (3h 45m)
  - **Phase 3a (1:15–2:30):** Backend scaffolding → 75 min
  - **Phase 3b (2:30–4:00):** Core frontend + Auth → 90 min
  - **Phase 3c (4:00–5:00):** Attendance & Payroll flows → 60 min

---

## Phase 1: Architecture (0:00–0:30)

### Tech Stack (Your Preferences Adapted for 5-Hour Build)
| Layer | Tech | Why |
|-------|------|-----|
| **Backend** | Python Flask | Quick scaffolding, built-in utilities |
| **Database** | SQLite | Zero setup, perfect for hackathon |
| **Frontend** | HTML5 + Tailwind CSS + Vanilla JS | Clean, fast, no build step |
| **Auth** | JWT (simple) | Stateless, fast to implement |
| **Deployment** | Local Flask server | Focus on features, not ops |

### Core Data Model (Minimal but Complete)

```
users (id, email, password_hash, role, name, department, salary)
↓
attendance (id, user_id, date, status, check_in, check_out)
↓
leaves (id, user_id, start_date, end_date, type, status, approver_id)
↓
payroll (id, user_id, payrun_month, gross_salary, pf, tax, net_pay, generated_at)
```

### Role-Based Access (Simplified for Hackathon)
1. **Admin** → Full access to all modules + user management
2. **Employee** → View own attendance, apply leave, see payslip
3. **HR Officer** → Manage employee records, approve/reject leave
4. **Payroll Officer** → Generate payroll, view reports

**For this hackathon: Focus on Admin + Employee roles first** (implement HR/Payroll as bonus if time allows)

### API Routes (Minimum Viable)
```
Auth:
  POST /auth/register
  POST /auth/login

Attendance:
  POST /attendance/mark
  GET /attendance/my-logs
  GET /attendance/all (admin only)

Leave:
  POST /leave/apply
  GET /leave/my-requests
  GET /leave/pending (admin only)
  PATCH /leave/:id/approve (admin)
  PATCH /leave/:id/reject (admin)

Payroll:
  GET /payroll/my-slip
  POST /payroll/generate (admin only)
  GET /payroll/all (admin only)

Dashboard:
  GET /dashboard/metrics (charts data)
```

---

## Phase 2: Figma UI Design (0:30–1:15)

### 5 Critical Screens to Design
1. **Login Screen** (all roles)
2. **Employee Dashboard** (personal stats)
3. **Mark Attendance** (employee action)
4. **Apply Leave** (employee action)
5. **Admin Dashboard** (overview + employee list)

### Design System (Keep It Minimal)
- **Colors:** WorkZen Purple (#6B4C9A), Warning Orange (#F59E0B), Success Green (#10B981)
- **Typography:** Inter (system font fallback)
- **Layout:** 12-column grid, 16px base unit
- **Components:** Simple card, button, form input, badge

### Mockup Link
*Create in Figma quickly — focus on layout, not polish*

---

## Phase 3: Build (1:15–5:00)

### Phase 3a: Backend Scaffolding (1:15–2:30)

**File structure:**
```
workzen/
  ├── app.py                 # Flask app + routes
  ├── models.py              # SQLAlchemy models
  ├── auth.py                # JWT helpers
  ├── database.db            # SQLite (auto-created)
  └── templates/
      └── (not used — API only for this build)
  └── static/
      ├── index.html         # Frontend
      ├── styles.css         # Tailwind
      └── script.js          # Vanilla JS
```

**Quick Flask setup (copy-paste ready):**
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///workzen.db'
app.config['SECRET_KEY'] = 'your-secret-key-change-this'
db = SQLAlchemy(app)
CORS(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, default='employee')  # admin, employee, hr, payroll
    name = db.Column(db.String, nullable=False)
    department = db.Column(db.String)
    salary = db.Column(db.Float, default=0)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    date = db.Column(db.Date, default=datetime.utcnow)
    status = db.Column(db.String)  # present, absent, half-day
    check_in = db.Column(db.DateTime)
    check_out = db.Column(db.DateTime)

class Leave(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    type = db.Column(db.String)  # vacation, sick, personal
    status = db.Column(db.String, default='pending')  # pending, approved, rejected
    approver_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Payroll(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    payrun_month = db.Column(db.String)  # YYYY-MM
    gross_salary = db.Column(db.Float)
    pf = db.Column(db.Float)  # 12% of basic
    tax = db.Column(db.Float)  # Professional tax
    net_pay = db.Column(db.Float)
    generated_at = db.Column(db.DateTime, default=datetime.utcnow)

# Auth Routes
@app.route('/auth/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return {'error': 'Email exists'}, 400
    user = User(
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        name=data['name'],
        role='employee'
    )
    db.session.add(user)
    db.session.commit()
    return {'message': 'Registered'}, 201

@app.route('/auth/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return {'error': 'Invalid credentials'}, 401
    token = jwt.encode({'user_id': user.id, 'role': user.role}, app.config['SECRET_KEY'], algorithm='HS256')
    return {'token': token, 'role': user.role, 'name': user.name}, 200

# Attendance Routes
@app.route('/attendance/mark', methods=['POST'])
def mark_attendance():
    data = request.json
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    user_id = payload['user_id']
    
    attendance = Attendance(user_id=user_id, status=data['status'])
    db.session.add(attendance)
    db.session.commit()
    return {'message': 'Attendance marked'}, 201

@app.route('/attendance/my-logs', methods=['GET'])
def get_my_attendance():
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    user_id = payload['user_id']
    
    logs = Attendance.query.filter_by(user_id=user_id).all()
    return {'logs': [{'date': str(log.date), 'status': log.status} for log in logs]}, 200

# Leave Routes
@app.route('/leave/apply', methods=['POST'])
def apply_leave():
    data = request.json
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    user_id = payload['user_id']
    
    leave = Leave(
        user_id=user_id,
        start_date=data['start_date'],
        end_date=data['end_date'],
        type=data['type']
    )
    db.session.add(leave)
    db.session.commit()
    return {'message': 'Leave applied'}, 201

@app.route('/leave/pending', methods=['GET'])
def get_pending_leaves():
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    
    if payload['role'] != 'admin':
        return {'error': 'Unauthorized'}, 403
    
    leaves = Leave.query.filter_by(status='pending').all()
    return {'leaves': [{'id': l.id, 'user_id': l.user_id, 'start': str(l.start_date), 'end': str(l.end_date), 'type': l.type} for l in leaves]}, 200

@app.route('/leave/<int:leave_id>/approve', methods=['PATCH'])
def approve_leave(leave_id):
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    
    if payload['role'] != 'admin':
        return {'error': 'Unauthorized'}, 403
    
    leave = Leave.query.get(leave_id)
    leave.status = 'approved'
    db.session.commit()
    return {'message': 'Leave approved'}, 200

# Payroll Routes
@app.route('/payroll/generate', methods=['POST'])
def generate_payroll():
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    
    if payload['role'] != 'admin':
        return {'error': 'Unauthorized'}, 403
    
    data = request.json
    month = data['month']  # YYYY-MM
    
    users = User.query.all()
    for user in users:
        # Simple payroll: base salary - PF (12%) - tax (2%)
        pf = user.salary * 0.12
        tax = user.salary * 0.02
        net = user.salary - pf - tax
        
        payroll = Payroll(
            user_id=user.id,
            payrun_month=month,
            gross_salary=user.salary,
            pf=pf,
            tax=tax,
            net_pay=net
        )
        db.session.add(payroll)
    db.session.commit()
    return {'message': 'Payroll generated'}, 201

@app.route('/dashboard/metrics', methods=['GET'])
def get_metrics():
    token = request.headers.get('Authorization', '').split(' ')[1]
    payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    
    if payload['role'] != 'admin':
        return {'error': 'Unauthorized'}, 403
    
    total_employees = User.query.filter_by(role='employee').count()
    today_attendance = Attendance.query.filter_by(date=datetime.utcnow().date()).count()
    pending_leaves = Leave.query.filter_by(status='pending').count()
    
    return {
        'total_employees': total_employees,
        'today_attendance': today_attendance,
        'pending_leaves': pending_leaves
    }, 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
```

**Install dependencies (1 minute):**
```bash
pip install flask flask-cors flask-sqlalchemy pyjwt werkzeug
```

---

### Phase 3b: Frontend + Auth (2:30–4:00)

**Create `static/index.html`:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WorkZen HRMS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        :root {
            --primary: #6B4C9A;
            --warning: #F59E0B;
            --success: #10B981;
        }
        body { font-family: system-ui, sans-serif; }
        .workzen-purple { color: var(--primary); }
        .bg-workzen { background-color: var(--primary); }
        .screen { display: none; }
        .screen.active { display: block; }
    </style>
</head>
<body class="bg-gray-50">

<!-- LOGIN SCREEN -->
<div id="login-screen" class="screen active">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h1 class="text-3xl font-bold workzen-purple mb-2">WorkZen</h1>
            <p class="text-gray-600 mb-6">Smart HR Management System</p>
            
            <form id="login-form">
                <input type="email" id="login-email" placeholder="Email" class="w-full border rounded px-3 py-2 mb-4" required>
                <input type="password" id="login-password" placeholder="Password" class="w-full border rounded px-3 py-2 mb-4" required>
                <button type="submit" class="w-full bg-workzen text-white py-2 rounded font-semibold hover:opacity-90">Login</button>
            </form>
            
            <p class="text-center mt-4 text-gray-600">
                Don't have an account? <a href="#" onclick="switchScreen('register-screen')" class="workzen-purple font-semibold">Register</a>
            </p>
        </div>
    </div>
</div>

<!-- REGISTER SCREEN -->
<div id="register-screen" class="screen">
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-900">
        <div class="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
            <h1 class="text-3xl font-bold workzen-purple mb-2">WorkZen</h1>
            <p class="text-gray-600 mb-6">Create Your Account</p>
            
            <form id="register-form">
                <input type="text" id="register-name" placeholder="Full Name" class="w-full border rounded px-3 py-2 mb-4" required>
                <input type="email" id="register-email" placeholder="Email" class="w-full border rounded px-3 py-2 mb-4" required>
                <input type="password" id="register-password" placeholder="Password" class="w-full border rounded px-3 py-2 mb-4" required>
                <button type="submit" class="w-full bg-workzen text-white py-2 rounded font-semibold hover:opacity-90">Register</button>
            </form>
            
            <p class="text-center mt-4 text-gray-600">
                Already have an account? <a href="#" onclick="switchScreen('login-screen')" class="workzen-purple font-semibold">Login</a>
            </p>
        </div>
    </div>
</div>

<!-- EMPLOYEE DASHBOARD -->
<div id="dashboard-screen" class="screen">
    <nav class="bg-workzen text-white p-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">WorkZen</h1>
        <div>
            <span id="user-name" class="mr-4"></span>
            <button onclick="logout()" class="bg-red-500 px-4 py-2 rounded">Logout</button>
        </div>
    </nav>

    <div class="max-w-6xl mx-auto p-6">
        <h2 class="text-3xl font-bold mb-6">Dashboard</h2>

        <!-- Tabs -->
        <div class="flex border-b mb-6">
            <button onclick="switchTab('overview')" class="tab-btn active px-4 py-2 border-b-2 border-workzen">Overview</button>
            <button onclick="switchTab('attendance')" class="tab-btn px-4 py-2">Attendance</button>
            <button onclick="switchTab('leave')" class="tab-btn px-4 py-2">Leave</button>
            <button onclick="switchTab('payslip')" class="tab-btn px-4 py-2">Payslip</button>
        </div>

        <!-- Overview Tab -->
        <div id="overview-tab" class="tab-content">
            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-6">
                    <p class="text-gray-600">Present Days</p>
                    <p class="text-3xl font-bold workzen-purple" id="present-count">0</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <p class="text-gray-600">Leaves Used</p>
                    <p class="text-3xl font-bold" id="leaves-count" style="color: var(--warning);">0</p>
                </div>
                <div class="bg-white rounded-lg shadow p-6">
                    <p class="text-gray-600">Next Payroll</p>
                    <p class="text-3xl font-bold" id="next-payroll" style="color: var(--success);">Pending</p>
                </div>
            </div>
        </div>

        <!-- Attendance Tab -->
        <div id="attendance-tab" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-xl font-bold mb-4">Mark Attendance</h3>
                <form id="attendance-form" class="flex gap-4">
                    <select id="attendance-status" class="border rounded px-3 py-2" required>
                        <option value="">Select Status</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half-day">Half Day</option>
                    </select>
                    <button type="submit" class="bg-workzen text-white px-6 py-2 rounded">Mark</button>
                </form>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-bold mb-4">Your Attendance Log</h3>
                <div id="attendance-log" class="space-y-2">
                    <p class="text-gray-600">Loading...</p>
                </div>
            </div>
        </div>

        <!-- Leave Tab -->
        <div id="leave-tab" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-xl font-bold mb-4">Apply for Leave</h3>
                <form id="leave-form" class="space-y-4">
                    <input type="date" id="leave-start" class="w-full border rounded px-3 py-2" placeholder="Start Date" required>
                    <input type="date" id="leave-end" class="w-full border rounded px-3 py-2" placeholder="End Date" required>
                    <select id="leave-type" class="w-full border rounded px-3 py-2" required>
                        <option value="">Select Leave Type</option>
                        <option value="vacation">Vacation</option>
                        <option value="sick">Sick Leave</option>
                        <option value="personal">Personal Leave</option>
                    </select>
                    <button type="submit" class="w-full bg-workzen text-white py-2 rounded">Apply Leave</button>
                </form>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-bold mb-4">Your Leave Requests</h3>
                <div id="leave-log" class="space-y-2">
                    <p class="text-gray-600">Loading...</p>
                </div>
            </div>
        </div>

        <!-- Payslip Tab -->
        <div id="payslip-tab" class="tab-content hidden">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-xl font-bold mb-4">Latest Payslip</h3>
                <div id="payslip-content">
                    <p class="text-gray-600">No payslip available yet</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- ADMIN DASHBOARD -->
<div id="admin-dashboard" class="screen">
    <nav class="bg-workzen text-white p-4 flex justify-between items-center">
        <h1 class="text-2xl font-bold">WorkZen Admin</h1>
        <button onclick="logout()" class="bg-red-500 px-4 py-2 rounded">Logout</button>
    </nav>

    <div class="max-w-6xl mx-auto p-6">
        <h2 class="text-3xl font-bold mb-6">Admin Dashboard</h2>

        <!-- Metrics -->
        <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-600">Total Employees</p>
                <p class="text-3xl font-bold workzen-purple" id="total-employees">0</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-600">Today's Attendance</p>
                <p class="text-3xl font-bold" id="today-attendance" style="color: var(--success);">0</p>
            </div>
            <div class="bg-white rounded-lg shadow p-6">
                <p class="text-gray-600">Pending Leaves</p>
                <p class="text-3xl font-bold" id="pending-leaves" style="color: var(--warning);">0</p>
            </div>
        </div>

        <!-- Tabs -->
        <div class="flex border-b mb-6">
            <button onclick="switchAdminTab('employees')" class="tab-btn active px-4 py-2 border-b-2 border-workzen">Employees</button>
            <button onclick="switchAdminTab('leaves')" class="tab-btn px-4 py-2">Leave Approvals</button>
            <button onclick="switchAdminTab('payroll')" class="tab-btn px-4 py-2">Payroll</button>
        </div>

        <!-- Employees Tab -->
        <div id="employees-tab" class="tab-content bg-white rounded-lg shadow p-6">
            <div id="employees-list" class="space-y-2">
                <p class="text-gray-600">Loading employees...</p>
            </div>
        </div>

        <!-- Leave Approvals Tab -->
        <div id="leaves-tab" class="tab-content hidden bg-white rounded-lg shadow p-6">
            <div id="leaves-list" class="space-y-2">
                <p class="text-gray-600">Loading pending leaves...</p>
            </div>
        </div>

        <!-- Payroll Tab -->
        <div id="payroll-tab" class="tab-content hidden bg-white rounded-lg shadow p-6">
            <form id="payroll-form" class="mb-6">
                <input type="month" id="payroll-month" class="border rounded px-3 py-2 mr-4" required>
                <button type="submit" class="bg-workzen text-white px-6 py-2 rounded">Generate Payroll</button>
            </form>
            <div id="payroll-status" class="text-gray-600"></div>
        </div>
    </div>
</div>

<script>
const API_URL = 'http://localhost:5000';
let token = localStorage.getItem('token');
let userRole = localStorage.getItem('userRole');

// Auth
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
        })
    });
    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userName', data.name);
        token = data.token;
        userRole = data.role;
        if (userRole === 'admin') {
            switchScreen('admin-dashboard');
            loadAdminDashboard();
        } else {
            switchScreen('dashboard-screen');
            document.getElementById('user-name').textContent = data.name;
            loadEmployeeDashboard();
        }
    } else {
        alert('Login failed');
    }
});

document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: document.getElementById('register-name').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value
        })
    });
    if (res.ok) {
        alert('Registered! Now login.');
        switchScreen('login-screen');
    } else {
        alert('Registration failed');
    }
});

document.getElementById('attendance-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            status: document.getElementById('attendance-status').value
        })
    });
    if (res.ok) {
        alert('Attendance marked!');
        loadAttendanceLogs();
    }
});

document.getElementById('leave-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/leave/apply`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            start_date: document.getElementById('leave-start').value,
            end_date: document.getElementById('leave-end').value,
            type: document.getElementById('leave-type').value
        })
    });
    if (res.ok) {
        alert('Leave applied!');
        document.getElementById('leave-form').reset();
        loadLeaveRequests();
    }
});

document.getElementById('payroll-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/payroll/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            month: document.getElementById('payroll-month').value
        })
    });
    if (res.ok) {
        document.getElementById('payroll-status').textContent = 'Payroll generated successfully!';
    }
});

// Helper functions
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('border-b-2', 'border-workzen'));
    event.target.classList.add('border-b-2', 'border-workzen');
}

function switchAdminTab(tabName) {
    document.querySelectorAll('[id$="-tab"]').forEach(t => t.classList.add('hidden'));
    document.getElementById(tabName + '-tab').classList.remove('hidden');
}

function logout() {
    localStorage.clear();
    switchScreen('login-screen');
}

// Load data functions
async function loadAttendanceLogs() {
    const res = await fetch(`${API_URL}/attendance/my-logs`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const html = data.logs.map(log => `<div class="border-l-4 border-workzen pl-4 py-2"><strong>${log.date}</strong> - ${log.status}</div>`).join('');
    document.getElementById('attendance-log').innerHTML = html || '<p class="text-gray-600">No records yet</p>';
    document.getElementById('present-count').textContent = data.logs.filter(l => l.status === 'present').length;
}

async function loadLeaveRequests() {
    // Would fetch and display leave requests
    document.getElementById('leave-log').innerHTML = '<p class="text-gray-600">No leave requests yet</p>';
}

async function loadEmployeeDashboard() {
    loadAttendanceLogs();
    loadLeaveRequests();
}

async function loadAdminDashboard() {
    const res = await fetch(`${API_URL}/dashboard/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('total-employees').textContent = data.total_employees;
    document.getElementById('today-attendance').textContent = data.today_attendance;
    document.getElementById('pending-leaves').textContent = data.pending_leaves;
}

// Auto-load if token exists
if (token) {
    if (userRole === 'admin') {
        switchScreen('admin-dashboard');
        loadAdminDashboard();
    } else {
        switchScreen('dashboard-screen');
        document.getElementById('user-name').textContent = localStorage.getItem('userName');
        loadEmployeeDashboard();
    }
}
</script>

</body>
</html>
```

---

### Phase 3c: Connect & Polish (4:00–5:00)

1. **Test auth flows** (register → login → dashboard)
2. **Test attendance marking** (POST to backend, verify DB)
3. **Test leave application** (create leave, check DB)
4. **Admin: Generate payroll** (manually calculate, store in DB)
5. **Fix bugs & edge cases**

---

## What to Prioritize (in order)

1. ✅ **Auth (login/register)** — Everything depends on this
2. ✅ **Attendance marking** — Core employee feature  
3. ✅ **Leave application** — Second core feature
4. ✅ **Admin dashboard metrics** — Shows system working
5. ⚠️ **Payroll generation** — If time: simple calculation
6. ❌ **HR Officer/Payroll Officer roles** — Skip for hackathon MVP
7. ❌ **Charts/graphs** — Show data as text, not charts
8. ❌ **Email notifications** — Too complex for 5 hours

---

## Running the System

```bash
# Terminal 1: Backend
cd workzen
python app.py

# Terminal 2: Open browser
# http://localhost:5000/static/index.html

# Test user (auto-create as admin):
# Email: admin@workzen.com
# Password: admin123
```

---

## Figma Design (Minimal, Do This in 45 min)

Focus on **layout only**, not pixel-perfect design:
1. **Login card** (centered, simple form)
2. **Employee dashboard** (3-column layout, sidebar)
3. **Mark attendance modal** (dropdown + button)
4. **Apply leave form** (date pickers)
5. **Admin overview** (3 metric cards + table)

Use Figma's **Quick actions** to speed up:
- Duplicate components 3x
- Use auto-layout for spacing
- Stick to 2–3 colors (purple, orange, green)

---

## Success Metrics (for end of 5 hours)

- [ ] Users can register & login ✅
- [ ] Employees can mark attendance ✅
- [ ] Employees can apply leave ✅
- [ ] Admins see dashboard metrics ✅
- [ ] Admins can generate payroll (basic) ✅
- [ ] All data persists in SQLite ✅
- [ ] Frontend is HTML + Tailwind (clean UI) ✅
- [ ] GitHub repo with 10+ meaningful commits ✅

---

## Hidden Wins to Showcase

- **Business logic understanding**: Explain payroll calculation (attendance → wage → deductions)
- **Role-based access**: Show how different roles see different data
- **Real-world ERP flow**: Demonstrate Employees → Attendance → Payroll pipeline
- **Scalable architecture**: Mention how to add more modules (recruitment, performance, etc.)

---

## Next Steps After Hackathon

If you win & continue:
1. Add HR Officer & Payroll Officer roles
2. Build actual Figma designs (higher fidelity)
3. Add PDF generation for payslips
4. Deploy to cloud (AWS/GCP)
5. Add real email integration (Twilio)
6. Build mobile app (React Native — your preference!)

