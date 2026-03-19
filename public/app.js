<<<<<<< HEAD
const API_URL = 'http://localhost:5000/api';
=======
const API_URL = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/api`;
>>>>>>> 9a613a8 (Initial commit)
let map;
let markers = [];

const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return { 'Authorization': `Bearer ${token}` };
};

const checkAuth = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const pathname = window.location.pathname;

  if (!token && (pathname.includes('dashboard') || pathname.includes('admin'))) {
    window.location.href = 'login.html';
  }
  if (token && (pathname.includes('login') || pathname.includes('signup') || pathname === '/' || pathname.endsWith('index.html'))) {
    if (userRole === 'Admin') window.location.href = 'admin.html';
    else window.location.href = 'dashboard.html';
  }
};
checkAuth();

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#loginForm button');
    btn.disabled = true; btn.innerText = "Loading...";
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        window.location.href = data.role === 'Admin' ? 'admin.html' : 'dashboard.html';
      } else alert(data.message);
    } catch (err) { alert('Error logging in'); }
    btn.disabled = false; btn.innerText = "Login";
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#signupForm button');
    btn.disabled = true; btn.innerText = "Loading...";
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);
        window.location.href = data.role === 'Admin' ? 'admin.html' : 'dashboard.html';
      } else alert(data.message);
    } catch (err) { alert('Error signing up'); }
    btn.disabled = false; btn.innerText = "Sign Up";
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = 'login.html';
  });
}

const userNameEl = document.getElementById('userName');
if (userNameEl && localStorage.getItem('name')) {
  userNameEl.innerText = `${localStorage.getItem('name')}`;
}

const initMap = (lat = 28.6139, lng = 77.2090) => {
  if (document.getElementById('map')) {
    map = L.map('map').setView([lat, lng], 11);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);
  }
};

const addMarker = (complaint) => {
  if (!map) return;
  const lat = complaint.latitude || (complaint.location && complaint.location.lat) || 0;
  const lng = complaint.longitude || (complaint.location && complaint.location.lng) || 0;
  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`<b>${complaint.title}</b><br>${complaint.category}<br>${complaint.status}`);
  markers.push(marker);
};

const renderFeed = (complaints) => {
  const container = document.getElementById('feedContainer');
  if(!container) return;
  container.innerHTML = '';
  if(complaints.length === 0) {
    container.innerHTML = '<div class="text-center p-8 bg-white/5 rounded-2xl border border-white/10"><i class="fas fa-folder-open text-4xl text-slate-500 mb-3"></i><p class="text-slate-400">No complaints found.</p></div>';
    return;
  }
  
  complaints.forEach(c => {
    const defaultImg = 'https://images.unsplash.com/photo-1584985449079-052cc15cb539?fit=crop&w=500&q=60';
    const cleanStatus = c.status.replace(" ", "");
    const dateSubmitted = new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const lat = c.latitude || (c.location && c.location.lat) || 0;
    const lng = c.longitude || (c.location && c.location.lng) || 0;
    
    container.innerHTML += `
      <div class="card fade-in cursor-pointer group" onclick="openDetailsModal('${c._id}')">
        <img src="${c.image || defaultImg}" alt="issue" class="card-img transition duration-500 group-hover:scale-105" onerror="this.src='${defaultImg}'" onclick="event.stopPropagation(); openImageModal(this.src)">
        <div class="card-content">
          <div class="flex justify-between items-start mb-2">
            <h4 class="card-title text-xl m-0">${c.title}</h4>
            <span class="badge ${cleanStatus}">${c.status}</span>
          </div>
          <div class="text-slate-300 text-sm mb-4 line-clamp-2">${c.description || 'No description provided.'}</div>
          <div class="card-department text-xs"><i class="fas fa-building text-indigo-400"></i> ${c.department}</div>
          <div class="card-meta text-xs">
            <span><i class="fas fa-map-marker-alt text-rose-400"></i> ${c.address || (c.location && c.location.address) || 'Unknown'}</span>
            <span class="ml-auto"><i class="far fa-clock text-slate-400"></i> ${dateSubmitted}</span>
          </div>
          <div class="action-buttons mt-4 pt-4 border-t border-white/10" onclick="event.stopPropagation()">
            <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="btn-nav">
              <i class="fas fa-location-arrow"></i> Navigate
            </a>
            <button onclick="map && map.setView([${lat}, ${lng}], 15)" class="btn-nav">
              <i class="fas fa-map"></i> View on Map
            </button>
          </div>
        </div>
      </div>
    `;
    addMarker(c);
  });
};

let allComplaints = [];
const fetchComplaints = async () => {
  try {
    const res = await fetch(`${API_URL}/complaints`, { headers: getAuthHeaders() });
    const data = await res.json();
    if(res.ok) {
      allComplaints = data;
      renderFeed(data);
      renderAdminDashboard(data);
    } else {
        if(res.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    }
  } catch (err) { console.error('Fetch error:', err); }
};

if (window.location.pathname.includes('dashboard') || window.location.pathname.includes('admin')) {
  if (navigator.geolocation && map === undefined && document.getElementById('map')) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { initMap(pos.coords.latitude, pos.coords.longitude); },
      () => { initMap(); }
    );
  } else if (!map) {
    initMap();
  }
  
  fetchComplaints();

  if (typeof io !== 'undefined') {
    const socket = io('http://localhost:5000');
    socket.on('newComplaint', (c) => {
      allComplaints.unshift(c);
      renderFeed(allComplaints);
      renderAdminDashboard(allComplaints);
    });
    socket.on('statusUpdate', (c) => {
      const idx = allComplaints.findIndex(x => x._id === c._id);
      if(idx > -1) allComplaints[idx] = c;
      renderFeed(allComplaints);
      renderAdminDashboard(allComplaints);
    });
    socket.on('complaintDeleted', (id) => {
      allComplaints = allComplaints.filter(x => x._id !== id);
      renderFeed(allComplaints);
      renderAdminDashboard(allComplaints);
    });
  }
}

const modal = document.getElementById('complaintModal');
const openBtn = document.getElementById('openModalBtn');
const closeBtn = document.getElementById('closeModalBtn');
const pickLocBtn = document.getElementById('pickLocationBtn');

if (openBtn) openBtn.onclick = () => modal.classList.add('active');
if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

if (pickLocBtn) {
  pickLocBtn.onclick = () => {
    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        document.getElementById('cLat').value = pos.coords.latitude;
        document.getElementById('cLng').value = pos.coords.longitude;
        document.getElementById('cAddress').value = 'Location Pinned (' + pos.coords.latitude.toFixed(3) + ', ' + pos.coords.longitude.toFixed(3) + ')';
      });
    } else {
        alert("Geolocation not supported");
    }
  };
}

const cForm = document.getElementById('complaintForm');
if (cForm) {
  cForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('#complaintForm button[type="submit"]');
    btn.disabled = true; btn.innerHTML = "Submitting...";

    const formData = new FormData();
    formData.append('title', document.getElementById('cTitle').value);
    formData.append('category', document.getElementById('cCategory').value);
    formData.append('description', document.getElementById('cDesc').value);
    formData.append('lat', document.getElementById('cLat').value || 28.6139);
    formData.append('lng', document.getElementById('cLng').value || 77.2090);
    formData.append('address', document.getElementById('cAddress').value || 'Unknown');
    
    if(document.getElementById('cImage').files[0]) {
      formData.append('image', document.getElementById('cImage').files[0]);
    }

    try {
      const res = await fetch(`${API_URL}/complaint`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData
      });
      if(res.ok) {
        modal.classList.remove('active');
        cForm.reset();
      } else {
          const err = await res.json();
          alert('Error: ' + err.message);
      }
    } catch (err) { alert(err); }

    btn.disabled = false; btn.innerHTML = "Submit Complaint";
  });
}

let statusChartObj = null;
const renderAdminDashboard = (complaints) => {
  if(document.getElementById('totalC')) document.getElementById('totalC').innerText = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  
  if(document.getElementById('pendingC')) document.getElementById('pendingC').innerText = pending;
  if(document.getElementById('resolvedC')) document.getElementById('resolvedC').innerText = resolved;

  const ctx = document.getElementById('statusChart');
  if (ctx && typeof Chart !== 'undefined') {
    if (statusChartObj) statusChartObj.destroy();
    statusChartObj = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved'],
        datasets: [{
          data: [pending, inProgress, resolved],
          backgroundColor: ['#ffd600', '#00b0ff', '#00c853'],
          borderWidth: 0
        }]
      },
      options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } } 
      }
    });
  }

  const tbody = document.getElementById('adminTableBody');
  if (tbody) {
    if (complaints.length === 0) {
      tbody.innerHTML = '<div class="col-span-1 sm:col-span-2 text-center p-8 bg-white/5 rounded-2xl border border-white/10"><i class="fas fa-folder-open text-4xl text-slate-500 mb-3"></i><p class="text-slate-400">No complaints available.</p></div>';
      return;
    }
    tbody.innerHTML = '';
    complaints.forEach(c => {
      const defaultImg = 'https://images.unsplash.com/photo-1584985449079-052cc15cb539?fit=crop&w=500&q=60';
      const cleanStatus = c.status.replace(" ", "");
      const dateSubmitted = new Date(c.createdAt || Date.now()).toLocaleDateString('en-US');
      const lat = c.latitude || (c.location && c.location.lat) || 0;
      const lng = c.longitude || (c.location && c.location.lng) || 0;

      // Card Layout instead of Table Row
      tbody.innerHTML += `
        <div class="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg transition hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl cursor-pointer group" onclick="openDetailsModal('${c._id}')">
          <div class="h-40 relative">
            <img src="${c.image || defaultImg}" class="w-full h-full object-cover transition duration-500 group-hover:scale-105" onerror="this.src='${defaultImg}'" onclick="event.stopPropagation(); openImageModal(this.src)">
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
            <div class="absolute bottom-3 left-4 right-4 flex justify-between items-end">
              <span class="badge ${cleanStatus}">${c.status}</span>
              <span class="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded-md backdrop-blur-sm"><i class="far fa-clock"></i> ${dateSubmitted}</span>
            </div>
          </div>
          <div class="p-5">
            <h4 class="text-lg font-bold text-white mb-1 truncate">${c.title}</h4>
            <div class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">${c.category}</div>
            <div class="text-sm text-slate-300 mb-4 line-clamp-2"><i class="fas fa-map-marker-alt text-rose-400 mr-1"></i> ${c.address || 'Unknown'}</div>
            
            <div class="flex flex-wrap gap-2 items-center" onclick="event.stopPropagation()">
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white transition text-xs font-semibold flex-1 text-center" title="Navigate">
                <i class="fas fa-location-arrow mr-1"></i> Location
              </a>
              <select onchange="updateStatus('${c._id}', this.value)" class="flex-1 text-xs bg-slate-800 border-white/10 rounded-lg px-2 py-1.5 text-white outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
              </select>
              <button onclick="deleteComplaint('${c._id}')" class="px-3 py-1.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500 hover:text-white transition" title="Delete">
                <i class="fas fa-trash text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    });
  }
};

// Modal logic
window.openImageModal = (src) => {
  const modal = document.getElementById('imageModal');
  const img = document.getElementById('lightboxImage');
  if(modal && img) {
    img.src = src;
    modal.classList.remove('hidden');
  }
};
window.closeImageModal = () => {
  const modal = document.getElementById('imageModal');
  if(modal) modal.classList.add('hidden');
};

window.openDetailsModal = (id) => {
  const c = allComplaints.find(x => x._id === id);
  if(!c) return;
  
  const defaultImg = 'https://images.unsplash.com/photo-1584985449079-052cc15cb539?fit=crop&w=500&q=60';
  const cleanStatus = c.status.replace(" ", "");
  const dateSubmitted = new Date(c.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const lat = c.latitude || (c.location && c.location.lat) || 0;
  const lng = c.longitude || (c.location && c.location.lng) || 0;

  document.getElementById('modalTitle').innerText = c.title || 'Complaint Details';
  document.getElementById('modalCategory').innerText = c.category || 'General';
  
  const statusEl = document.getElementById('modalStatus');
  statusEl.className = `px-3 py-1 rounded-full text-xs font-semibold badge ${cleanStatus}`;
  statusEl.innerText = c.status;
  
  document.getElementById('modalDate').innerText = dateSubmitted;
  document.getElementById('modalImg').src = c.image || defaultImg;
  document.getElementById('modalDesc').innerText = c.description || 'No description provided.';
  document.getElementById('modalDept').innerHTML = `<i class="fas fa-building text-indigo-400"></i> ${c.department || 'General'}`;
  document.getElementById('modalLoc').innerHTML = `<i class="fas fa-map-marker-alt text-rose-400"></i> ${c.address || 'Unknown'}`;

  document.getElementById('modalActions').innerHTML = `
    <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" class="px-5 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500 hover:text-white transition text-sm font-semibold flex items-center justify-center gap-2 flex-1">
      <i class="fas fa-location-arrow"></i> Target Location
    </a>
    <div class="flex-1 flex gap-2">
      <select onchange="updateStatus('${c._id}', this.value); closeDetailsModal();" class="flex-1 text-sm bg-slate-800 border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:ring-1 focus:ring-indigo-500">
        <option value="Pending" ${c.status === 'Pending' ? 'selected' : ''}>Pending</option>
        <option value="In Progress" ${c.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
        <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
      </select>
      <button onclick="deleteComplaint('${c._id}'); closeDetailsModal();" class="px-5 py-2.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg hover:bg-rose-500 hover:text-white transition font-semibold" title="Delete">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;

  document.getElementById('detailsModal').classList.remove('hidden');
};
window.closeDetailsModal = () => {
  const modal = document.getElementById('detailsModal');
  if(modal) modal.classList.add('hidden');
};

window.updateStatus = async (id, status) => {
  try {
    const res = await fetch(`${API_URL}/complaint/${id}`, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if(!res.ok) {
       const data = await res.json();
       alert(data.message || 'Error updating. Admin privilege required.');
       fetchComplaints();
    }
  } catch(e) { console.error(e); }
};

window.deleteComplaint = async (id) => {
  if(!confirm('Are you sure you want to delete this complaint?')) return;
  try {
    const res = await fetch(`${API_URL}/complaint/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if(!res.ok) {
       const data = await res.json();
       alert(data.message || 'Error deleting. Admin privilege required.');
    }
  } catch(e) { console.error(e); }
};
