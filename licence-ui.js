// ===== ALLURIEL - licence-ui.js (client + admin) =====
const LICENSE_PRICE_USD = 15;
const LICENSE_REQUESTS_KEY = "manualLicenseRequests";

function getAllLicenseRequests(){ return JSON.parse(localStorage.getItem(LICENSE_REQUESTS_KEY))||[]; }
function saveAllLicenseRequests(r){ localStorage.setItem(LICENSE_REQUESTS_KEY, JSON.stringify(r)); }
function isAdminUser(){ return currentUser && currentUser.role === "admin"; }

function generateLicenseKey(userId){
    const r = Math.random().toString(36).slice(2,10).toUpperCase();
    const t = Date.now().toString(36).toUpperCase();
    return "ALL-" + userId + "-" + r + "-" + t;
}

// ===== CLIENT =====
function submitManualPayment(){
    if (!currentUser) { alert("Connectez-vous"); return; }
    const method = document.getElementById("paymentMethod").value;
    const phone = document.getElementById("paymentPhone").value.trim();
    const ref = document.getElementById("paymentReference").value.trim();
    const amount = parseFloat(document.getElementById("paymentAmount").value)||LICENSE_PRICE_USD;
    if(!method||!phone||!ref){ alert("⚠️ Champs requis"); return; }
    const requests = getAllLicenseRequests();
    if (requests.some(r=>r.reference===ref && r.userId===currentUser.id)){ alert("Cette référence a déjà été soumise."); return; }
    requests.unshift({
        id: Date.now().toString(), userId: currentUser.id, username: currentUser.username,
        churchName: currentUser.egliseName, email: currentUser.email,
        method, phone, reference: ref, amount,
        status: "EN_ATTENTE", licenseKey: "", createdAt: new Date().toISOString()
    });
    saveAllLicenseRequests(requests);
    document.getElementById("paymentPhone").value="";
    document.getElementById("paymentReference").value="";
    document.getElementById("paymentAmount").value=LICENSE_PRICE_USD;
    renderLicenceModule();
    alert("✅ Demande envoyée. L'administrateur va valider votre paiement et vous remettre votre clé de licence.");
}

function activateManualKey(){
    const k = document.getElementById("manualLicenseKey").value.trim();
    if(!k){ alert("⚠️ Collez la clé"); return; }
    const all = JSON.parse(localStorage.getItem("users"))||[];
    const me = all.find(u=>u.id===currentUser.id);
    if(!me){ alert("Utilisateur introuvable"); return; }
    // accepter si elle existe dans une demande approuvée pour ce user
    const req = getAllLicenseRequests().find(r=>r.userId===currentUser.id && r.licenseKey===k && r.status==="APPROUVE");
    if(!req){ alert("❌ Clé invalide ou non approuvée pour votre compte"); return; }
    me.licenseKey = k;
    me.status = "ACTIVE";
    localStorage.setItem("users", JSON.stringify(all));
    alert("✅ Licence activée ! Reconnectez-vous.");
    handleLogout();
}

function renderLicenceModule(){
    const status = document.getElementById("licenceStatus");
    const my = document.getElementById("myRequests");
    if(!status||!currentUser) return;
    const all = JSON.parse(localStorage.getItem("users"))||[];
    const me = all.find(u=>u.id===currentUser.id);
    if (me && me.licenseKey && me.status === "ACTIVE"){
        status.innerHTML = `<h3>✅ Licence active</h3><p><strong>Clé :</strong> <code>${me.licenseKey}</code></p><p><strong>Statut :</strong> Active</p>`;
    } else {
        status.innerHTML = `<h3>⏳ Aucune licence active</h3><p>Effectuez un paiement de 15 USD pour activer votre logiciel.</p>`;
    }
    const mine = getAllLicenseRequests().filter(r=>r.userId===currentUser.id);
    my.innerHTML = "<h3>Mes demandes</h3>" + (mine.length===0?"<p class='muted'>Aucune demande</p>"
      : `<table class="table"><thead><tr><th>Date</th><th>Mode</th><th>Référence</th><th>Montant</th><th>Statut</th><th>Clé</th></tr></thead><tbody>`+
        mine.map(r=>`<tr><td>${formatDate(r.createdAt)}</td><td>${r.method}</td><td>${r.reference}</td><td>${r.amount} USD</td><td><span class="badge ${r.status==='APPROUVE'?'badge-success':r.status==='REJETE'?'badge-danger':'badge-info'}">${r.status}</span></td><td>${r.licenseKey?`<code>${r.licenseKey}</code>`:'-'}</td></tr>`).join("")+`</tbody></table>`);
}

// ===== ADMIN =====
function refreshAdminDashboard(){
    const grid = document.getElementById("adminStats"); if(!grid) return;
    const all = JSON.parse(localStorage.getItem("users"))||[];
    const reqs = getAllLicenseRequests();
    const totalUsers = all.filter(u=>u.role!=='admin').length;
    const active = all.filter(u=>u.status==='ACTIVE' && u.role!=='admin').length;
    const pending = reqs.filter(r=>r.status==='EN_ATTENTE').length;
    const revenue = reqs.filter(r=>r.status==='APPROUVE').reduce((s,r)=>s+(parseFloat(r.amount)||0),0);
    grid.innerHTML = [
        ["👥 Clients", totalUsers],
        ["✅ Actifs", active],
        ["⏳ Demandes en attente", pending],
        ["💵 Revenus validés", "$ " + revenue.toFixed(2)]
    ].map(([t,v])=>`<div class="stat-card"><h3>${t}</h3><p class="stat-value">${v}</p></div>`).join("");
}

function renderUsersTable(){
    const tb = document.querySelector("#userTable tbody"); if(!tb) return;
    const all = JSON.parse(localStorage.getItem("users"))||[];
    tb.innerHTML = all.map((u,idx)=>`<tr>
        <td>${u.username}</td><td>${u.email||'-'}</td><td>${u.egliseName||'-'}</td>
        <td>${u.role}</td>
        <td><span class="badge ${u.status==='ACTIVE'?'badge-success':u.status==='SUSPENDED'?'badge-danger':'badge-info'}">${u.status||'-'}</span></td>
        <td>${u.licenseKey?'<code>'+u.licenseKey+'</code>':'-'}</td>
        <td>
            ${u.role!=='admin'?`
              <button class="btn-edit" onclick="adminToggleStatus(${u.id})">${u.status==='ACTIVE'?'⏸️ Suspendre':'▶️ Activer'}</button>
              <button class="btn-delete" onclick="adminDeleteUser(${u.id})">🗑️</button>
            `:'<em>compte protégé</em>'}
        </td>
    </tr>`).join("");
}
function adminToggleStatus(id){
    const all = JSON.parse(localStorage.getItem("users"))||[];
    const u = all.find(x=>x.id===id); if(!u) return;
    u.status = u.status==='ACTIVE'?'SUSPENDED':'ACTIVE';
    localStorage.setItem("users", JSON.stringify(all));
    renderUsersTable(); refreshAdminDashboard();
}
function adminDeleteUser(id){
    if(!confirm("Supprimer définitivement cet utilisateur ?")) return;
    let all = JSON.parse(localStorage.getItem("users"))||[];
    all = all.filter(x=>x.id!==id);
    localStorage.setItem("users", JSON.stringify(all));
    renderUsersTable(); refreshAdminDashboard();
}

function renderAdminLicences(){
    const pending = document.getElementById("pendingLicenseList");
    const tb = document.querySelector("#licenseTable tbody");
    const reqs = getAllLicenseRequests();
    const wait = reqs.filter(r=>r.status==='EN_ATTENTE');
    pending.innerHTML = wait.length===0?"<p class='muted'>Aucune demande en attente</p>"
      : wait.map(r=>`<div class="card">
          <h3>${r.username} · ${r.churchName}</h3>
          <p>📱 ${r.method} · ${r.phone} · Réf : <strong>${r.reference}</strong> · ${r.amount} USD</p>
          <p>Reçu le ${formatDate(r.createdAt)}</p>
          <button class="btn-add" onclick="approveLicenseRequest('${r.id}')">✅ Approuver & générer clé</button>
          <button class="btn-delete" onclick="rejectLicenseRequest('${r.id}')">❌ Rejeter</button>
        </div>`).join("");
    if (tb){
        tb.innerHTML = reqs.map(r=>`<tr>
            <td>${r.licenseKey?'<code>'+r.licenseKey+'</code>':'-'}</td>
            <td>${r.username}</td><td>${r.churchName}</td>
            <td>${r.method}</td><td>${r.reference}</td>
            <td><span class="badge ${r.status==='APPROUVE'?'badge-success':r.status==='REJETE'?'badge-danger':'badge-info'}">${r.status}</span></td>
            <td>${formatDate(r.createdAt)}</td>
        </tr>`).join("");
    }
}
function approveLicenseRequest(id){
    const reqs = getAllLicenseRequests();
    const r = reqs.find(x=>x.id===id); if(!r) return;
    const key = generateLicenseKey(r.userId);
    r.status = "APPROUVE"; r.licenseKey = key;
    saveAllLicenseRequests(reqs);
    // active aussi le user
    const all = JSON.parse(localStorage.getItem("users"))||[];
    const u = all.find(x=>x.id===r.userId);
    if (u){ u.licenseKey = key; u.status = "ACTIVE"; localStorage.setItem("users", JSON.stringify(all)); }
    alert("✅ Licence approuvée. Clé : " + key + "\nCommuniquez-la au client.");
    renderAdminLicences(); refreshAdminDashboard(); renderUsersTable();
}
function rejectLicenseRequest(id){
    const reqs = getAllLicenseRequests();
    const r = reqs.find(x=>x.id===id); if(!r) return;
    r.status = "REJETE"; saveAllLicenseRequests(reqs);
    renderAdminLicences(); refreshAdminDashboard();
}
