// ===== AUTHENTIFICATION ALLURIEL =====
// Compte admin caché : alluriel_admin / NDAGANO@2026 / code secret : ALLURIEL-2026
const ADMIN_SECRET = "ALLURIEL-2026";

let users = JSON.parse(localStorage.getItem("users")) || [
    {
        id: 1,
        username: "alluriel_admin",
        password: "NDAGANO@2026",
        email: "ndagano@alluriel.app",
        egliseName: "ALLURIEL Administration",
        role: "admin",
        status: "ACTIVE",
        licenseKey: "ADMIN-MASTER-KEY",
        createdAt: new Date().toISOString()
    }
];
// Persiste l'admin si premier lancement
if (!localStorage.getItem("users")) localStorage.setItem("users", JSON.stringify(users));

let currentUser = null;
// Données globales (rechargées par utilisateur)
let membres=[], dimes=[], offrandes=[], groupes=[], plans=[], objets=[], evenements=[],
    cimetiere=[], baptemes=[], mariages=[], discommunions=[], oeuvres=[], procesVerbaux=[];

document.addEventListener("DOMContentLoaded", function() {
    checkSession();
    // Raccourci clavier admin caché : Ctrl+Shift+A
    document.addEventListener("keydown", function(e) {
        if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
            e.preventDefault();
            document.getElementById("adminLoginModal").style.display = "block";
        }
    });
});

function checkSession() {
    const sessionUser = JSON.parse(localStorage.getItem("currentUser"));
    if (sessionUser) {
        currentUser = sessionUser;
        showMainApp();
    } else {
        showLoginScreen();
    }
}

function showLoginScreen() {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("mainApp").style.display = "none";
}

function showMainApp() {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    document.getElementById("currentUser").innerText = currentUser.username;
    document.getElementById("userInfo").innerText = "🏢 " + currentUser.egliseName;
    setupInterfaceForRole();
    loadUserData();
    if (currentUser.role === "admin") {
        showModule("admin");
        if (typeof refreshAdminDashboard === "function") refreshAdminDashboard();
    } else {
        showModule("dashboard");
        if (typeof refreshDashboard === "function") refreshDashboard();
    }
}

// ===== LOGIN CLIENT =====
function handleLogin() {
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value;
    if (!username) { alert("⚠️ Nom d'utilisateur requis"); return; }

    // Recharger users depuis storage (au cas où admin a activé)
    users = JSON.parse(localStorage.getItem("users")) || users;
    const user = users.find(u => u.username === username);
    if (!user) { alert("❌ Utilisateur introuvable"); return; }
    if (user.role === "admin") {
        alert("⛔ Ce compte nécessite l'accès administrateur sécurisé (Ctrl+Shift+A).");
        return;
    }
    if (user.password !== password) { alert("❌ Mot de passe incorrect"); return; }
    if (user.status !== "ACTIVE") { alert("⏳ Votre compte n'est pas encore activé. Effectuez le paiement et attendez la validation de l'administrateur."); return; }
    if (!user.licenseKey) { alert("🔑 Aucune licence active. Veuillez activer votre licence."); return; }

    loginAs(user);
}

// ===== LOGIN ADMIN CACHÉ =====
function handleAdminLogin() {
    const u = document.getElementById("adminUserInput").value.trim();
    const p = document.getElementById("adminPassInput").value;
    const s = document.getElementById("adminSecretInput").value;
    if (s !== ADMIN_SECRET) { alert("❌ Code secret invalide"); return; }
    users = JSON.parse(localStorage.getItem("users")) || users;
    const user = users.find(x => x.username === u && x.role === "admin");
    if (!user || user.password !== p) { alert("❌ Identifiants admin invalides"); return; }
    closeAdminLogin();
    loginAs(user);
}
function closeAdminLogin() {
    document.getElementById("adminLoginModal").style.display = "none";
    document.getElementById("adminUserInput").value = "";
    document.getElementById("adminPassInput").value = "";
    document.getElementById("adminSecretInput").value = "";
}

function loginAs(user) {
    currentUser = { id:user.id, username:user.username, email:user.email, egliseName:user.egliseName, role:user.role };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
    localStorage.setItem("currentUserPrefix", "user_" + user.id + "_");
    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
    showMainApp();
}

function handleLogout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentUserPrefix");
    currentUser = null;
    location.reload();
}

// ===== INSCRIPTION CLIENT =====
function showRegisterModal(){ document.getElementById("registerModal").style.display = "block"; }
function closeRegisterModal(){ document.getElementById("registerModal").style.display = "none"; }

function handleRegister() {
    const egliseName = document.getElementById("egliseNameInput").value.trim();
    const username   = document.getElementById("registerUsernameInput").value.trim();
    const email      = document.getElementById("registerEmailInput").value.trim();
    const password   = document.getElementById("registerPasswordInput").value;
    const passwordC  = document.getElementById("registerPasswordConfirmInput").value;
    if (!egliseName||!username||!email||!password||!passwordC) { alert("⚠️ Champs requis"); return; }
    if (password !== passwordC) { alert("⚠️ Mots de passe différents"); return; }
    if (password.length < 4) { alert("⚠️ Mot de passe trop court"); return; }
    users = JSON.parse(localStorage.getItem("users")) || users;
    if (users.some(u => u.username === username)) { alert("❌ Nom déjà pris"); return; }
    if (users.some(u => u.email === email)) { alert("❌ Email déjà utilisé"); return; }
    const newUser = {
        id: Math.max(...users.map(u=>u.id), 0) + 1,
        username, password, email, egliseName,
        role: "client",
        status: "PENDING",       // doit être activé par admin
        licenseKey: null,
        createdAt: new Date().toISOString()
    };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Compte créé. Effectuez le paiement (15 USD Airtel/Orange Money) puis demandez l'activation à l'administrateur.");
    ["egliseNameInput","registerUsernameInput","registerEmailInput","registerPasswordInput","registerPasswordConfirmInput"].forEach(id=>document.getElementById(id).value="");
    closeRegisterModal();
}

// ===== INTERFACE PAR RÔLE =====
function setupInterfaceForRole() {
    const nav = document.getElementById("navButtons");
    if (currentUser.role === "admin") {
        nav.innerHTML = `
            <button onclick="showModule('admin')" class="btn-nav active">⚙️ Tableau</button>
            <button onclick="showModule('users')" class="btn-nav">👥 Utilisateurs</button>
            <button onclick="showModule('licenses')" class="btn-nav">🔑 Licences</button>
        `;
    } else {
        nav.innerHTML = `
            <button onclick="showModule('dashboard')" class="btn-nav active">🏠 Accueil</button>
            <button onclick="showModule('membres')" class="btn-nav">👤 Membres</button>
            <button onclick="showModule('dime')" class="btn-nav">💰 Dîme</button>
            <button onclick="showModule('offrande')" class="btn-nav">🙏 Offrande</button>
            <button onclick="showModule('groupe')" class="btn-nav">👥 Groupe</button>
            <button onclick="showModule('plan')" class="btn-nav">📋 Plan</button>
            <button onclick="showModule('evenement')" class="btn-nav">🎉 Événement</button>
            <button onclick="showModule('cimetiere')" class="btn-nav">⛑️ Cimetière</button>
            <button onclick="showModule('bapteme')" class="btn-nav">💧 Baptême</button>
            <button onclick="showModule('mariage')" class="btn-nav">💒 Mariage</button>
            <button onclick="showModule('discommunion')" class="btn-nav">⛔ Discommunion</button>
            <button onclick="showModule('pv')" class="btn-nav">📝 Procès-verbaux</button>
            <button onclick="showModule('oeuvres')" class="btn-nav">🌍 Œuvres</button>
            <button onclick="showModule('objets')" class="btn-nav">📦 Objets</button>
            <button onclick="showModule('stats')" class="btn-nav">📊 Stats</button>
            <button onclick="showModule('reports')" class="btn-nav">📄 Rapports</button>
            <button onclick="showModule('licence')" class="btn-nav">🔑 Licence</button>
        `;
    }
}

function showUserMenu() {
    const m = document.getElementById("userMenu");
    m.style.display = m.style.display === "none" ? "block" : "none";
}
document.addEventListener("click", function(e) {
    const menu = document.getElementById("userMenu");
    const btn = document.querySelector(".btn-user-menu");
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) menu.style.display = "none";
});

// ===== CHANGEMENT DE MDP =====
function showChangePasswordModal(){ document.getElementById("userMenu").style.display="none"; document.getElementById("changePasswordModal").style.display="block"; }
function closeChangePasswordModal(){ document.getElementById("changePasswordModal").style.display="none"; ["currentPasswordInput","newPasswordInput","confirmNewPasswordInput"].forEach(i=>document.getElementById(i).value=""); }
function handleChangePassword() {
    const cur = document.getElementById("currentPasswordInput").value;
    const np  = document.getElementById("newPasswordInput").value;
    const cp  = document.getElementById("confirmNewPasswordInput").value;
    users = JSON.parse(localStorage.getItem("users")) || users;
    const user = users.find(u => u.id === currentUser.id);
    if (!user || user.password !== cur) { alert("❌ Mot de passe actuel incorrect"); return; }
    if (np !== cp || np.length < 4) { alert("⚠️ Nouveau mot de passe invalide"); return; }
    user.password = np;
    localStorage.setItem("users", JSON.stringify(users));
    alert("✅ Mot de passe changé"); closeChangePasswordModal();
}

// ===== STORAGE PAR UTILISATEUR =====
function userPrefix(){ return localStorage.getItem("currentUserPrefix") || "user_global_"; }
function saveUserData(key, data){ localStorage.setItem(userPrefix()+key, JSON.stringify(data)); }
function getUserData(key){ const v = localStorage.getItem(userPrefix()+key); return v ? JSON.parse(v) : null; }

function loadUserData() {
    membres       = getUserData("membres") || [];
    dimes         = getUserData("dimes") || [];
    offrandes     = getUserData("offrandes") || [];
    groupes       = getUserData("groupes") || [];
    plans         = getUserData("plans") || [];
    objets        = getUserData("objets") || [];
    evenements    = getUserData("evenements") || [];
    cimetiere     = getUserData("cimetiere") || [];
    baptemes      = getUserData("baptemes") || [];
    mariages      = getUserData("mariages") || [];
    discommunions = getUserData("discommunions") || [];
    oeuvres       = getUserData("oeuvres") || [];
    procesVerbaux = getUserData("procesVerbaux") || [];

    [["displayMembres"],["displayDimes"],["displayOffrandes"],["displayGroupes"],["displayPlans"],
     ["displayObjets"],["displayEvenements"],["displayInhumations"],["displayBaptemes"],["displayMariages"],
     ["displayDiscommunions"],["displayOeuvres"],["displayPV"],["updateStatistics"],["renderLicenceModule"]
    ].forEach(([f])=>{ if(typeof window[f]==="function") try{window[f]();}catch(e){} });
}
