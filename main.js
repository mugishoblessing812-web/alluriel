// ===== ALLURIEL - main.js =====
let devise = "USD";
const deviseSymbols = { USD:"$", FRF:"F", EUR:"€", XAF:"F" };

function showModule(id){
    document.querySelectorAll(".module").forEach(m => m.style.display="none");
    document.querySelectorAll(".btn-nav").forEach(b => b.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
    if (window.event && window.event.target && window.event.target.classList) window.event.target.classList.add("active");
    if (id === "stats") updateStatistics();
    if (id === "dashboard" && typeof refreshDashboard === "function") refreshDashboard();
    if (id === "admin" && typeof refreshAdminDashboard === "function") refreshAdminDashboard();
    if (id === "users" && typeof renderUsersTable === "function") renderUsersTable();
    if (id === "licenses" && typeof renderAdminLicences === "function") renderAdminLicences();
    if (id === "licence" && typeof renderLicenceModule === "function") renderLicenceModule();
}

function saveToStorage(key, data){ saveUserData(key, data); }
function formatDate(d){ if(!d) return "-"; return new Date(d).toLocaleDateString("fr-FR"); }
function formatMoney(amount){
    if (isNaN(amount) || amount === null) amount = 0;
    amount = parseFloat(amount) || 0;
    return deviseSymbols[devise] + " " + amount.toFixed(2).replace(".", ",");
}
function changeDevise(){
    devise = document.getElementById("deviseSelect").value;
    const sel = document.getElementById("deviseSelect");
    document.getElementById("deviseActuelle").innerText = "Devise : " + sel.options[sel.selectedIndex].text;
    displayDimes(); displayOffrandes(); updateStatistics();
}
function calcAge(dob){ if(!dob) return "-"; const d=new Date(dob); const t=new Date(); let a=t.getFullYear()-d.getFullYear(); const m=t.getMonth()-d.getMonth(); if(m<0||(m===0&&t.getDate()<d.getDate())) a--; return a; }

// ===== MEMBRES =====
function addMembre(){
    const nom = document.getElementById("nomMembre").value.trim();
    if(!nom){ alert("⚠️ Nom requis"); return; }
    membres.push({
        id: Date.now(), nom,
        email: document.getElementById("emailMembre").value.trim(),
        tel: document.getElementById("telMembre").value.trim(),
        dateNaissance: document.getElementById("dateNaissanceMembre").value,
        adresse: document.getElementById("adresseMembre").value.trim()
    });
    saveToStorage("membres", membres);
    ["nomMembre","emailMembre","telMembre","dateNaissanceMembre","adresseMembre"].forEach(i=>document.getElementById(i).value="");
    displayMembres(); updateStatistics();
}
function displayMembres(){
    const tb = document.querySelector("#membreTable tbody"); if(!tb) return;
    tb.innerHTML = membres.length===0 ? "<tr><td colspan='6' style='text-align:center'>Aucun membre</td></tr>"
      : membres.map((m,i)=>`<tr><td>${m.nom}</td><td>${m.email||"-"}</td><td>${m.tel||"-"}</td><td>${formatDate(m.dateNaissance)}</td><td>${m.adresse||"-"}</td><td><button class="btn-delete" onclick="deleteMembre(${i})">🗑️</button></td></tr>`).join("");
    document.getElementById("countMembres").innerText = membres.length;
}
function deleteMembre(i){ if(confirm("Supprimer ?")){ membres.splice(i,1); saveToStorage("membres",membres); displayMembres(); updateStatistics(); } }

// ===== DÎMES =====
function addDime(){
    const nom = document.getElementById("nomDime").value.trim();
    const montant = parseFloat(document.getElementById("montantDime").value);
    const date = document.getElementById("dateDime").value;
    if(!nom||isNaN(montant)||!date){ alert("⚠️ Champs requis"); return; }
    dimes.push({id:Date.now(), nom, montant, date});
    saveToStorage("dimes", dimes);
    ["nomDime","montantDime","dateDime"].forEach(i=>document.getElementById(i).value="");
    displayDimes(); updateStatistics();
}
function displayDimes(){
    const tb=document.querySelector("#dimeTable tbody"); if(!tb) return;
    tb.innerHTML = dimes.length===0?"<tr><td colspan='4' style='text-align:center'>Aucune dîme</td></tr>"
      : dimes.map((d,i)=>`<tr><td>${d.nom}</td><td>${formatMoney(d.montant)}</td><td>${formatDate(d.date)}</td><td><button class="btn-delete" onclick="deleteDime(${i})">🗑️</button></td></tr>`).join("");
    const total = dimes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    document.getElementById("totalDime").innerText = formatMoney(total);
}
function deleteDime(i){ dimes.splice(i,1); saveToStorage("dimes",dimes); displayDimes(); updateStatistics(); }

// ===== OFFRANDES =====
function addOffrande(){
    const nom = document.getElementById("nomOffrande").value.trim();
    const montant = parseFloat(document.getElementById("montantOffrande").value);
    const date = document.getElementById("dateOffrande").value;
    if(!nom||isNaN(montant)||!date){ alert("⚠️ Champs requis"); return; }
    offrandes.push({id:Date.now(), nom, montant, date});
    saveToStorage("offrandes", offrandes);
    ["nomOffrande","montantOffrande","dateOffrande"].forEach(i=>document.getElementById(i).value="");
    displayOffrandes(); updateStatistics();
}
function displayOffrandes(){
    const tb=document.querySelector("#offrandeTable tbody"); if(!tb) return;
    tb.innerHTML = offrandes.length===0?"<tr><td colspan='4' style='text-align:center'>Aucune offrande</td></tr>"
      : offrandes.map((d,i)=>`<tr><td>${d.nom}</td><td>${formatMoney(d.montant)}</td><td>${formatDate(d.date)}</td><td><button class="btn-delete" onclick="deleteOffrande(${i})">🗑️</button></td></tr>`).join("");
    const total = offrandes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    document.getElementById("totalOffrande").innerText = formatMoney(total);
}
function deleteOffrande(i){ offrandes.splice(i,1); saveToStorage("offrandes",offrandes); displayOffrandes(); updateStatistics(); }

// ===== GROUPES =====
function addGroupe(){
    const nom = document.getElementById("nomGroupe").value.trim();
    const resp = document.getElementById("responsableGroupe").value.trim();
    const nb = parseInt(document.getElementById("membresGroupe").value)||0;
    if(!nom||!resp){ alert("⚠️ Champs requis"); return; }
    groupes.push({id:Date.now(), nom, responsable:resp, membres:nb});
    saveToStorage("groupes", groupes);
    ["nomGroupe","responsableGroupe","membresGroupe"].forEach(i=>document.getElementById(i).value="");
    displayGroupes(); updateStatistics();
}
function displayGroupes(){
    const c=document.getElementById("groupeList"); if(!c) return;
    c.innerHTML = groupes.length===0?"<p>Aucun groupe</p>"
      : groupes.map((g,i)=>`<div class="card"><h3>${g.nom}</h3><p><strong>Responsable :</strong> ${g.responsable}</p><p><strong>Membres :</strong> ${g.membres}</p><button class="btn-delete" onclick="deleteGroupe(${i})">🗑️</button></div>`).join("");
}
function deleteGroupe(i){ groupes.splice(i,1); saveToStorage("groupes",groupes); displayGroupes(); }

// ===== PLANS =====
function addPlan(){
    const t=document.getElementById("titrePlan").value.trim();
    const d=document.getElementById("descPlan").value.trim();
    const date=document.getElementById("datePlan").value;
    if(!t||!date){ alert("⚠️ Titre et date requis"); return; }
    plans.push({id:Date.now(), titre:t, desc:d, date});
    saveToStorage("plans", plans);
    ["titrePlan","descPlan","datePlan"].forEach(i=>document.getElementById(i).value="");
    displayPlans();
}
function displayPlans(){
    const c=document.getElementById("planList"); if(!c) return;
    c.innerHTML = plans.length===0?"<p>Aucun plan</p>"
      : plans.map((p,i)=>`<div class="card"><h3>${p.titre}</h3><p>${p.desc||""}</p><p><strong>Date :</strong> ${formatDate(p.date)}</p><button class="btn-delete" onclick="deletePlan(${i})">🗑️</button></div>`).join("");
}
function deletePlan(i){ plans.splice(i,1); saveToStorage("plans",plans); displayPlans(); }

// ===== ÉVÉNEMENTS =====
function addEvenement(){
    const nom=document.getElementById("nomEvenement").value.trim();
    const desc=document.getElementById("descEvenement").value.trim();
    const date=document.getElementById("dateEvenement").value;
    const heure=document.getElementById("heureEvenement").value;
    const lieu=document.getElementById("lieuEvenement").value.trim();
    if(!nom||!date||!lieu){ alert("⚠️ Champs requis"); return; }
    evenements.push({id:Date.now(), nom, desc, date, heure, lieu});
    saveToStorage("evenements", evenements);
    ["nomEvenement","descEvenement","dateEvenement","heureEvenement","lieuEvenement"].forEach(i=>document.getElementById(i).value="");
    displayEvenements();
}
function displayEvenements(){
    const c=document.getElementById("evenementList"); if(!c) return;
    c.innerHTML = evenements.length===0?"<p>Aucun événement</p>"
      : evenements.map((e,i)=>`<div class="card"><h3>${e.nom}</h3><p>${e.desc||""}</p><p>📅 ${formatDate(e.date)} ${e.heure||""}</p><p>📍 ${e.lieu}</p><button class="btn-delete" onclick="deleteEvenement(${i})">🗑️</button></div>`).join("");
}
function deleteEvenement(i){ evenements.splice(i,1); saveToStorage("evenements",evenements); displayEvenements(); }

// ===== CIMETIÈRE =====
function addInhumation(){
    const nom=document.getElementById("nomDefunt").value.trim();
    const dn=document.getElementById("dateNaissance").value;
    const di=document.getElementById("dateInhumation").value;
    const sec=document.getElementById("sectionCimetiere").value.trim();
    const fam=document.getElementById("familleDefunt").value.trim();
    const rem=document.getElementById("remarqueCimetiere").value.trim();
    if(!nom||!di||!sec||!fam){ alert("⚠️ Champs requis"); return; }
    cimetiere.push({id:Date.now(), nom, dateNaissance:dn, dateInhumation:di, section:sec, famille:fam, remarque:rem});
    saveToStorage("cimetiere", cimetiere);
    ["nomDefunt","dateNaissance","dateInhumation","sectionCimetiere","familleDefunt","remarqueCimetiere"].forEach(i=>document.getElementById(i).value="");
    displayInhumations();
}
function displayInhumations(){
    const tb=document.querySelector("#cimetiereTa tbody"); if(!tb) return;
    tb.innerHTML = cimetiere.length===0?"<tr><td colspan='7' style='text-align:center'>Aucune inhumation</td></tr>"
      : cimetiere.map((c,i)=>`<tr><td>${c.nom}</td><td>${formatDate(c.dateNaissance)}</td><td>${formatDate(c.dateInhumation)}</td><td>${c.section}</td><td>${c.famille}</td><td>${c.remarque||"-"}</td><td><button class="btn-delete" onclick="deleteInhumation(${i})">🗑️</button></td></tr>`).join("");
    document.getElementById("countCimetiere").innerText = cimetiere.length;
}
function deleteInhumation(i){ cimetiere.splice(i,1); saveToStorage("cimetiere",cimetiere); displayInhumations(); }

// ===== BAPTÊMES (avec date de naissance) =====
function addBapteme(){
    const nom=document.getElementById("nomBaptise").value.trim();
    const dn=document.getElementById("dateNaissanceBaptise").value;
    const date=document.getElementById("dateBapteme").value;
    const par=document.getElementById("parrainBapteme").value.trim();
    const pas=document.getElementById("pastorBapteme").value.trim();
    const rem=document.getElementById("remarqueBapteme").value.trim();
    if(!nom||!dn||!date||!par||!pas){ alert("⚠️ Champs requis"); return; }
    baptemes.push({id:Date.now(), nom, dateNaissance:dn, date, parrain:par, pastor:pas, remarque:rem});
    saveToStorage("baptemes", baptemes);
    ["nomBaptise","dateNaissanceBaptise","dateBapteme","parrainBapteme","pastorBapteme","remarqueBapteme"].forEach(i=>document.getElementById(i).value="");
    displayBaptemes(); updateStatistics();
}
function displayBaptemes(){
    const tb=document.querySelector("#baptemeTable tbody"); if(!tb) return;
    tb.innerHTML = baptemes.length===0?"<tr><td colspan='8' style='text-align:center'>Aucun baptême</td></tr>"
      : baptemes.map((b,i)=>`<tr><td>${b.nom}</td><td>${formatDate(b.dateNaissance)}</td><td>${calcAge(b.dateNaissance)} ans</td><td>${formatDate(b.date)}</td><td>${b.parrain}</td><td>${b.pastor}</td><td>${b.remarque||"-"}</td><td><button class="btn-delete" onclick="deleteBapteme(${i})">🗑️</button></td></tr>`).join("");
    document.getElementById("countBapteme").innerText = baptemes.length;
}
function deleteBapteme(i){ baptemes.splice(i,1); saveToStorage("baptemes",baptemes); displayBaptemes(); updateStatistics(); }

// ===== MARIAGES (avec date naissance époux/épouse) =====
function addMariage(){
    const ne=document.getElementById("nomEpoux").value.trim();
    const dne=document.getElementById("dateNaissanceEpoux").value;
    const ns=document.getElementById("nomEpouse").value.trim();
    const dns=document.getElementById("dateNaissanceEpouse").value;
    const date=document.getElementById("dateMariage").value;
    const pas=document.getElementById("pastorMariage").value.trim();
    const tem=document.getElementById("temoins").value.trim();
    const rem=document.getElementById("remarqueMariage").value.trim();
    if(!ne||!dne||!ns||!dns||!date||!pas||!tem){ alert("⚠️ Champs requis"); return; }
    mariages.push({id:Date.now(), nomEpoux:ne, dateNaissanceEpoux:dne, nomEpouse:ns, dateNaissanceEpouse:dns, date, pastor:pas, temoins:tem, remarque:rem});
    saveToStorage("mariages", mariages);
    ["nomEpoux","dateNaissanceEpoux","nomEpouse","dateNaissanceEpouse","dateMariage","pastorMariage","temoins","remarqueMariage"].forEach(i=>document.getElementById(i).value="");
    displayMariages(); updateStatistics();
}
function displayMariages(){
    const tb=document.querySelector("#mariageTable tbody"); if(!tb) return;
    tb.innerHTML = mariages.length===0?"<tr><td colspan='9' style='text-align:center'>Aucun mariage</td></tr>"
      : mariages.map((m,i)=>`<tr><td>${m.nomEpoux}</td><td>${formatDate(m.dateNaissanceEpoux)}</td><td>${m.nomEpouse}</td><td>${formatDate(m.dateNaissanceEpouse)}</td><td>${formatDate(m.date)}</td><td>${m.pastor}</td><td>${m.temoins}</td><td>${m.remarque||"-"}</td><td><button class="btn-delete" onclick="deleteMariage(${i})">🗑️</button></td></tr>`).join("");
    document.getElementById("countMariage").innerText = mariages.length;
}
function deleteMariage(i){ mariages.splice(i,1); saveToStorage("mariages",mariages); displayMariages(); updateStatistics(); }

// ===== OBJETS =====
function addObjet(){
    const nom=document.getElementById("nomObjet").value.trim();
    const desc=document.getElementById("descObjet").value.trim();
    const type=document.getElementById("typeObjet").value;
    const qte=parseInt(document.getElementById("quantiteObjet").value)||0;
    const da=document.getElementById("dateAcquisitionObjet").value;
    if(!nom||!type||qte<=0){ alert("⚠️ Champs requis"); return; }
    objets.push({id:Date.now(), nom, desc, type, quantite:qte, dateAcquisition:da});
    saveToStorage("objets", objets);
    ["nomObjet","descObjet","typeObjet","dateAcquisitionObjet"].forEach(i=>document.getElementById(i).value="");
    document.getElementById("quantiteObjet").value="1";
    displayObjets();
}
function displayObjets(){
    const tb=document.querySelector("#objetTable tbody"); if(!tb) return;
    tb.innerHTML = objets.length===0?"<tr><td colspan='6' style='text-align:center'>Aucun objet</td></tr>"
      : objets.map((o,i)=>`<tr><td>${o.nom}</td><td>${o.type}</td><td>${o.desc||"-"}</td><td>${o.quantite}</td><td>${formatDate(o.dateAcquisition)}</td><td><button class="btn-delete" onclick="deleteObjet(${i})">🗑️</button></td></tr>`).join("");
}
function deleteObjet(i){ objets.splice(i,1); saveToStorage("objets",objets); displayObjets(); }

// ===== STATISTIQUES =====
function updateStatistics(){
    const grid = document.getElementById("statsGrid"); if(!grid) return;
    const totalDimes = dimes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    const totalOff = offrandes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    const stats = [
        ["👤 Membres", membres.length], ["💰 Dîmes (total)", formatMoney(totalDimes)],
        ["🙏 Offrandes (total)", formatMoney(totalOff)], ["💧 Baptêmes", baptemes.length],
        ["💒 Mariages", mariages.length], ["⛔ Discommunions", (discommunions||[]).length],
        ["📝 Procès-verbaux", (procesVerbaux||[]).length], ["🌍 Œuvres", (oeuvres||[]).length],
        ["⛑️ Inhumations", cimetiere.length], ["🎉 Événements", evenements.length],
        ["📦 Objets", objets.length], ["👥 Groupes", groupes.length]
    ];
    grid.innerHTML = stats.map(([t,v])=>`<div class="stat-card"><h3>${t}</h3><p class="stat-value">${v}</p></div>`).join("");
}

function refreshDashboard(){
    const w = document.getElementById("welcomeText");
    if (w) w.innerText = "Bienvenue " + (currentUser?.username||"") + " · " + (currentUser?.egliseName||"");
    const dg = document.getElementById("dashboardStats"); if(!dg) return;
    const totalDimes = dimes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    const totalOff = offrandes.reduce((s,d)=>s+(parseFloat(d.montant)||0),0);
    dg.innerHTML = [
        ["👤 Membres", membres.length],
        ["💰 Dîmes", formatMoney(totalDimes)],
        ["🙏 Offrandes", formatMoney(totalOff)],
        ["📝 PV", (procesVerbaux||[]).length],
        ["🌍 Œuvres", (oeuvres||[]).length],
        ["💒 Mariages", mariages.length]
    ].map(([t,v])=>`<div class="stat-card"><h3>${t}</h3><p class="stat-value">${v}</p></div>`).join("");
}
