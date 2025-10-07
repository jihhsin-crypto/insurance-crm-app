// Data storage keys
const CLIENTS_KEY = 'crm_clients';

// Utilities to load and save clients
function loadClients() {
  return JSON.parse(localStorage.getItem(CLIENTS_KEY) || '[]');
}

function saveClients(clients) {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

// Generate unique ID for clients
function generateId() {
  return 'c' + Date.now() + Math.random().toString(16).slice(2);
}

// Render client list table
function renderClientTable() {
  const tbody = document.querySelector('#client-table tbody');
  tbody.innerHTML = '';
  const clients = loadClients();
  clients.forEach((client) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${client.name}</td>
      <td>${client.phone}</td>
      <td>${client.grade}</td>
      <td>${client.address || ''}</td>
      <td>${client.lastContact || ''}</td>
      <td>${client.nextContact || ''}</td>
      <td>
        <button class="edit-btn" data-id="${client.id}">編輯</button>
        <button class="delete-btn" data-id="${client.id}">刪除</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  // Bind edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      openClientModal(id);
    });
  });
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      if (confirm('確定要刪除這位客戶？')) {
        let clients = loadClients();
        clients = clients.filter((c) => c.id !== id);
        saveClients(clients);
        renderClientTable();
        renderMonthlySchedule();
      }
    });
  });
}

// Show specific page view
function showPage(pageId) {
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
  // When switching to schedule page, refresh schedule list
  if (pageId === 'schedule') {
    renderMonthlySchedule();
  }
  // When switching to analysis page, refresh analytics
  if (pageId === 'analysis') {
    renderAnalysis();
  }
}

// Open client modal for new or existing client
function openClientModal(id) {
  const modal = document.getElementById('client-modal');
  const form = document.getElementById('client-form');
  const titleEl = document.getElementById('modal-title');
  // Reset form first
  form.reset();
  document.getElementById('client-id').value = '';
  if (id) {
    const clients = loadClients();
    const client = clients.find((c) => c.id === id);
    if (client) {
      titleEl.textContent = '編輯客戶';
      document.getElementById('client-id').value = client.id;
      document.getElementById('client-name').value = client.name;
      document.getElementById('client-phone').value = client.phone;
      document.getElementById('client-grade').value = client.grade;
      document.getElementById('client-address').value = client.address || '';
      document.getElementById('client-last-contact').value = client.lastContact || '';
      document.getElementById('client-next-contact').value = client.nextContact || '';
      // Prefill contact method and policy expiry
      document.getElementById('client-contact-method').value = client.contactMethod || '電話';
      document.getElementById('client-policy-expiry').value = client.policyExpiry || '';
      // Prefill car insurance expiry
      document.getElementById('client-car-insurance-expiry').value = client.carInsuranceExpiry || '';
    }
  } else {
    titleEl.textContent = '新增客戶';
    // Set default values for new client
    document.getElementById('client-contact-method').value = '電話';
    document.getElementById('client-policy-expiry').value = '';
    document.getElementById('client-car-insurance-expiry').value = '';
  }
  modal.classList.remove('hidden');
}

function closeClientModal() {
  const modal = document.getElementById('client-modal');
  modal.classList.add('hidden');
}

// Handle client form submission
document.getElementById('client-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('client-id').value;
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const grade = document.getElementById('client-grade').value;
  const address = document.getElementById('client-address').value.trim();
  const contactMethod = document.getElementById('client-contact-method').value;
  const lastContact = document.getElementById('client-last-contact').value;
  const nextContact = document.getElementById('client-next-contact').value;
  const policyExpiry = document.getElementById('client-policy-expiry').value;
  const carInsuranceExpiry = document.getElementById('client-car-insurance-expiry').value;
  let clients = loadClients();
  if (id) {
    // Update existing client
    const index = clients.findIndex((c) => c.id === id);
    if (index >= 0) {
      clients[index] = { id, name, phone, grade, address, contactMethod, lastContact, nextContact, policyExpiry, carInsuranceExpiry };
    }
  } else {
    // Add new client
    clients.push({ id: generateId(), name, phone, grade, address, contactMethod, lastContact, nextContact, policyExpiry, carInsuranceExpiry });
  }
  saveClients(clients);
  closeClientModal();
  renderClientTable();
  renderMonthlySchedule();
  renderAnalysis();
});

// Bind add client button
document.getElementById('add-client-btn').addEventListener('click', () => {
  openClientModal();
});

// Monthly schedule rendering
function renderMonthlySchedule() {
  const scheduleDiv = document.getElementById('monthly-schedule');
  const monthInput = document.getElementById('schedule-month');
  const selectedMonth = monthInput.value || new Date().toISOString().slice(0,7);
  // Ensure input shows selectedMonth
  monthInput.value = selectedMonth;
  const clients = loadClients();
  // Filter clients with nextContact matching selected month (YYYY-MM)
  const scheduleClients = clients.filter((c) => c.nextContact && c.nextContact.startsWith(selectedMonth));
  if (scheduleClients.length === 0) {
    scheduleDiv.innerHTML = '<p>此月份尚無預約拜訪。</p>';
    return;
  }
  let html = '<table class="schedule-table"><thead><tr><th>日期</th><th>客戶姓名</th><th>電話</th><th>目的</th></tr></thead><tbody>';
  scheduleClients.forEach((client) => {
    html += `<tr><td>${client.nextContact}</td><td>${client.name}</td><td>${client.phone}</td><td>${client.grade}</td></tr>`;
  });
  html += '</tbody></table>';
  scheduleDiv.innerHTML = html;
}

// Update schedule when month input changes
document.getElementById('schedule-month').addEventListener('change', () => {
  renderMonthlySchedule();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  renderClientTable();
  renderMonthlySchedule();
  renderAnalysis();
});

// Render analysis dashboard
function renderAnalysis() {
  // Ensure analysis DOM elements exist
  if (!document.getElementById('analysis')) return;
  const clients = loadClients();
  // Total clients
  document.getElementById('total-clients').textContent = clients.length;
  // Current month string
  const now = new Date();
  const yyyyMm = now.toISOString().slice(0, 7);
  // Monthly contact: clients whose lastContact date is this month
  const monthlyContactCount = clients.filter((c) => c.lastContact && c.lastContact.startsWith(yyyyMm)).length;
  document.getElementById('monthly-contact').textContent = monthlyContactCount;
  // Pending clients: clients without nextContact or nextContact earlier than today
  const todayStr = now.toISOString().split('T')[0];
  const pendingClients = clients.filter((c) => {
    if (!c.nextContact) return true;
    try {
      return new Date(c.nextContact) < new Date(todayStr);
    } catch (err) {
      return false;
    }
  });
  document.getElementById('pending-clients').textContent = pendingClients.length;
  // Policy expiry within 3 months
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);
  const expiringPolicies = clients.filter((c) => {
    if (c.policyExpiry) {
      try {
        return new Date(c.policyExpiry) <= threeMonths;
      } catch (err) {
        return false;
      }
    }
    return false;
  });
  document.getElementById('expiring-policy').textContent = expiringPolicies.length;
  // Populate lists
  const pendingListEl = document.getElementById('pending-clients-list');
  const expiringListEl = document.getElementById('expiring-policy-list');
  if (pendingListEl) {
    pendingListEl.innerHTML = '';
    pendingClients.forEach((client) => {
      const li = document.createElement('li');
      li.textContent = `${client.name} (${client.phone}) - ${client.nextContact || '未預約'}`;
      pendingListEl.appendChild(li);
    });
  }
  if (expiringListEl) {
    expiringListEl.innerHTML = '';
    expiringPolicies.forEach((client) => {
      const li = document.createElement('li');
      li.textContent = `${client.name} (${client.phone}) - ${client.policyExpiry}`;
      expiringListEl.appendChild(li);
    });
  }
  // Grade distribution
  const gradeCounts = { 'A級': 0, 'B級': 0, 'C級': 0, 'D級': 0 };
  clients.forEach((c) => {
    if (gradeCounts.hasOwnProperty(c.grade)) {
      gradeCounts[c.grade]++;
    }
  });
  // Contact method distribution
  const contactCounts = { '電話': 0, '訊息': 0 };
  clients.forEach((c) => {
    const method = c.contactMethod || '電話';
    if (contactCounts.hasOwnProperty(method)) {
      contactCounts[method]++;
    }
  });
  // Draw charts
  const gradeCanvas = document.getElementById('grade-chart');
  const contactCanvas = document.getElementById('contact-chart');
  if (gradeCanvas && gradeCanvas.getContext) {
    drawPieChart(gradeCanvas, gradeCounts);
  }
  if (contactCanvas && contactCanvas.getContext) {
    drawBarChart(contactCanvas, contactCounts);
  }
}

// Draw a simple pie chart on canvas given data object
function drawPieChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let startAngle = 0;
  const colors = ['#e53935', '#fb8c00', '#1e88e5', '#43a047'];
  let i = 0;
  Object.keys(data).forEach((key) => {
    const value = data[key];
    const angle = total ? (value / total) * Math.PI * 2 : 0;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      Math.min(canvas.width, canvas.height) / 2 - 10,
      startAngle,
      startAngle + angle
    );
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    startAngle += angle;
    i++;
  });
}

// Draw a simple bar chart on canvas given data object
function drawBarChart(canvas, data) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const keys = Object.keys(data);
  const maxVal = Math.max(...Object.values(data), 1);
  const barCount = keys.length;
  const margin = 20;
  const barWidth = (canvas.width - margin * 2) / barCount * 0.6;
  keys.forEach((key, index) => {
    const value = data[key];
    const barHeight = (value / maxVal) * (canvas.height - margin * 2 - 20);
    const x = margin + index * ((canvas.width - margin * 2) / barCount) + ((canvas.width - margin * 2) / barCount - barWidth) / 2;
    const y = canvas.height - margin - barHeight;
    // draw bar
    ctx.fillStyle = '#42a5f5';
    ctx.fillRect(x, y, barWidth, barHeight);
    // draw labels
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText(key, x + barWidth / 2, canvas.height - 5);
    ctx.fillText(value, x + barWidth / 2, y - 5);
  });
}