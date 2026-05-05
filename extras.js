// ===== ALLURIEL - extras.js : PV, Discommunion, Œuvres =====

// ============ DISCOMMUNION ============
function addDiscommunion(){
    const nom=document.getElementById("nomDiscom").value.trim();
    const date=document.getElementById("dateDiscom").value;
    const type=document.getElementById("typeDiscom").value;
    const motif=document.getElementById("motifDiscom").value.trim();
    const dec=document.getElementById("decideurDiscom").value.trim();
    const rem=document.getElementById("remarqueDiscom").value.trim();
    if(!nom||!date||!type||!motif||!dec){ alert("⚠️ Champs requis"); return; }
    discommunions.push({id:Date.now(), nom, date, type, motif, decideur:dec, remarque:rem});
    saveToStorage("discommunions", discommunions);
    ["nomDiscom","dateDiscom","typeDiscom","motifDiscom","decideurDiscom","remarqueDiscom"].forEach(i=>document.getElementById(i).value="");
    displayDiscommunions(); updateStatistics();
}
function displayDiscommunions(){
    const tb=document.querySelector("#discomTable tbody"); if(!tb) return;
    tb.innerHTML = discommunions.length===0?"<tr><td colspan='7' style='text-align:center'>Aucune entrée</td></tr>"
      : discommunions.map((d,i)=>`<tr><td>${d.nom}</td><td>${formatDate(d.date)}</td><td><span class="badge ${d.type==='Discommunion'?'badge-danger':'badge-success'}">${d.type}</span></td><td>${d.motif}</td><td>${d.decideur}</td><td>${d.remarque||"-"}</td><td><button class="btn-delete" onclick="deleteDiscommunion(${i})">🗑️</button></td></tr>`).join("");
    document.getElementById("countDiscom").innerText = discommunions.length;
}
function deleteDiscommunion(i){ if(confirm("Supprimer ?")){ discommunions.splice(i,1); saveToStorage("discommunions",discommunions); displayDiscommunions(); updateStatistics(); } }

// ============ ŒUVRES SOCIALES & ÉCONOMIQUES ============
function addOeuvre(){
    const nom=document.getElementById("nomOeuvre").value.trim();
    const cat=document.getElementById("categorieOeuvre").value;
    const resp=document.getElementById("responsableOeuvre").value.trim();
    const budget=parseFloat(document.getElementById("budgetOeuvre").value)||0;
    const revenu=parseFloat(document.getElementById("revenuOeuvre").value)||0;
    const dd=document.getElementById("dateDebutOeuvre").value;
    const statut=document.getElementById("statutOeuvre").value;
    const desc=document.getElementById("descOeuvre").value.trim();
    if(!nom||!cat||!resp){ alert("⚠️ Champs requis"); return; }
    oeuvres.push({id:Date.now(), nom, categorie:cat, responsable:resp, budget, revenu, dateDebut:dd, statut, desc});
    saveToStorage("oeuvres", oeuvres);
    ["nomOeuvre","categorieOeuvre","responsableOeuvre","budgetOeuvre","revenuOeuvre","dateDebutOeuvre","descOeuvre"].forEach(i=>document.getElementById(i).value="");
    displayOeuvres(); updateStatistics();
}
function displayOeuvres(){
    const tb=document.querySelector("#oeuvreTable tbody"); if(!tb) return;
    tb.innerHTML = oeuvres.length===0?"<tr><td colspan='8' style='text-align:center'>Aucune œuvre</td></tr>"
      : oeuvres.map((o,i)=>`<tr><td><strong>${o.nom}</strong><br><small>${o.desc||""}</small></td><td><span class="badge">${o.categorie}</span></td><td>${o.responsable}</td><td>${formatMoney(o.budget)}</td><td>${formatMoney(o.revenu)}</td><td>${formatDate(o.dateDebut)}</td><td><span class="badge ${o.statut==='Terminé'?'badge-success':o.statut==='Suspendu'?'badge-danger':'badge-info'}">${o.statut}</span></td><td><button class="btn-delete" onclick="deleteOeuvre(${i})">🗑️</button></td></tr>`).join("");
    const tb1 = oeuvres.reduce((s,o)=>s+(parseFloat(o.budget)||0),0);
    const tr1 = oeuvres.reduce((s,o)=>s+(parseFloat(o.revenu)||0),0);
    document.getElementById("totalBudgetOeuvre").innerText = formatMoney(tb1);
    document.getElementById("totalRevenuOeuvre").innerText = formatMoney(tr1);
}
function deleteOeuvre(i){ if(confirm("Supprimer ?")){ oeuvres.splice(i,1); saveToStorage("oeuvres",oeuvres); displayOeuvres(); updateStatistics(); } }

// ============ PROCÈS-VERBAUX ============
let _currentParticipants = []; // tampon avant enregistrement

function renderParticipantsBox(){
    const box = document.getElementById("participantsBox"); if(!box) return;
    if (_currentParticipants.length === 0){ box.innerHTML = "<p class='muted'>Aucun participant ajouté pour ce PV.</p>"; return; }
    box.innerHTML = `<table class="table"><thead><tr><th>Nom</th><th>Statut</th><th>Observation</th><th>Action</th></tr></thead><tbody>` +
        _currentParticipants.map((p,i)=>`<tr>
            <td>${p.nom}</td>
            <td>
              <select onchange="updateParticipantStatut(${i}, this.value)">
                <option ${p.statut==='Présent'?'selected':''}>Présent</option>
                <option ${p.statut==='Absent'?'selected':''}>Absent</option>
                <option ${p.statut==='Excusé'?'selected':''}>Excusé</option>
              </select>
            </td>
            <td><input type="text" value="${p.observation||''}" oninput="updateParticipantObs(${i}, this.value)" placeholder="Observation"></td>
            <td><button class="btn-delete" onclick="removeParticipant(${i})">🗑️</button></td>
        </tr>`).join("") + `</tbody></table>`;
}
function addParticipantToCurrent(){
    const v = document.getElementById("newParticipantName").value.trim();
    if(!v) return;
    _currentParticipants.push({ nom:v, statut:"Présent", observation:"" });
    document.getElementById("newParticipantName").value = "";
    renderParticipantsBox();
}
function updateParticipantStatut(i,v){ _currentParticipants[i].statut = v; }
function updateParticipantObs(i,v){ _currentParticipants[i].observation = v; }
function removeParticipant(i){ _currentParticipants.splice(i,1); renderParticipantsBox(); }

function addPV(){
    const titre=document.getElementById("titrePV").value.trim();
    const date=document.getElementById("datePV").value;
    const lieu=document.getElementById("lieuPV").value.trim();
    const pres=document.getElementById("presidentPV").value.trim();
    const sec=document.getElementById("secretairePV").value.trim();
    const od=document.getElementById("ordreJourPV").value.trim();
    const cont=document.getElementById("contenuPV").value.trim();
    const dec=document.getElementById("decisionsPV").value.trim();
    if(!titre||!date||!cont){ alert("⚠️ Titre, date et contenu requis"); return; }
    procesVerbaux.unshift({
        id:Date.now(), titre, date, lieu, president:pres, secretaire:sec,
        ordreJour:od, contenu:cont, decisions:dec,
        participants: _currentParticipants.slice()
    });
    saveToStorage("procesVerbaux", procesVerbaux);
    ["titrePV","datePV","lieuPV","presidentPV","secretairePV","ordreJourPV","contenuPV","decisionsPV"].forEach(i=>document.getElementById(i).value="");
    _currentParticipants = [];
    renderParticipantsBox();
    displayPV(); updateStatistics();
    alert("✅ PV enregistré");
}
function displayPV(){
    const c=document.getElementById("pvList"); if(!c) return;
    if(procesVerbaux.length===0){ c.innerHTML="<p>Aucun PV enregistré</p>"; return; }
    c.innerHTML = procesVerbaux.map((p,i)=>{
        const pres = (p.participants||[]).filter(x=>x.statut==='Présent').length;
        const abs = (p.participants||[]).filter(x=>x.statut==='Absent').length;
        const exc = (p.participants||[]).filter(x=>x.statut==='Excusé').length;
        return `<div class="card pv-card">
            <h3>${p.titre}</h3>
            <p>📅 ${formatDate(p.date)} ${p.lieu?'· 📍 '+p.lieu:''}</p>
            <p><strong>Président :</strong> ${p.president||'-'} · <strong>Secrétaire :</strong> ${p.secretaire||'-'}</p>
            <p><span class="badge badge-success">Présents : ${pres}</span> <span class="badge badge-danger">Absents : ${abs}</span> <span class="badge badge-info">Excusés : ${exc}</span></p>
            <details><summary>Détails</summary>
              <p><strong>Ordre du jour :</strong><br>${(p.ordreJour||'-').replace(/\n/g,'<br>')}</p>
              <p><strong>Contenu :</strong><br>${p.contenu.replace(/\n/g,'<br>')}</p>
              <p><strong>Décisions :</strong><br>${(p.decisions||'-').replace(/\n/g,'<br>')}</p>
              ${(p.participants&&p.participants.length)?'<p><strong>Participants :</strong></p><ul>'+p.participants.map(x=>`<li>${x.nom} — <em>${x.statut}</em>${x.observation?' ('+x.observation+')':''}</li>`).join("")+'</ul>':''}
            </details>
            <div style="margin-top:10px">
                <button class="btn-add" onclick="printPV(${i})">🖨️ Imprimer ce PV</button>
                <button class="btn-delete" onclick="deletePV(${i})">🗑️ Supprimer</button>
            </div>
        </div>`;
    }).join("");
}
function deletePV(i){ if(confirm("Supprimer ce PV ?")){ procesVerbaux.splice(i,1); saveToStorage("procesVerbaux",procesVerbaux); displayPV(); updateStatistics(); } }

function printPV(i){
    const p = procesVerbaux[i]; if(!p) return;
    const w = window.open("", "_blank", "width=900,height=700");
    const rows = (p.participants||[]).map(x=>`<tr><td>${x.nom}</td><td>${x.statut}</td><td>${x.observation||''}</td></tr>`).join("");
    w.document.write(`<html><head><title>PV - ${p.titre}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#222}
      h1{color:#4338ca;border-bottom:2px solid #4338ca;padding-bottom:8px}
      h2{color:#4338ca;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin-top:10px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left}
      th{background:#f0f0ff}
      .header{display:flex;align-items:center;gap:14px;margin-bottom:18px}
      .header img{width:60px;height:60px;object-fit:contain}
      .meta{display:flex;gap:30px;font-size:14px;color:#555}
      .footer{margin-top:40px;font-size:12px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:10px}
      </style></head><body>
      <div class="header"><img src="logo.png"><div><h1 style="margin:0;border:none">${currentUser?.egliseName||'Église'}</h1><div class="meta"><span>Procès-verbal</span><span>${formatDate(p.date)}</span></div></div></div>
      <h1>${p.titre}</h1>
      <p><strong>Lieu :</strong> ${p.lieu||'-'} · <strong>Président :</strong> ${p.president||'-'} · <strong>Secrétaire :</strong> ${p.secretaire||'-'}</p>
      <h2>Ordre du jour</h2><p>${(p.ordreJour||'-').replace(/\n/g,'<br>')}</p>
      <h2>Participants</h2>
      <table><thead><tr><th>Nom</th><th>Statut</th><th>Observation</th></tr></thead><tbody>${rows||'<tr><td colspan="3">Aucun</td></tr>'}</tbody></table>
      <h2>Délibérations</h2><p>${p.contenu.replace(/\n/g,'<br>')}</p>
      <h2>Décisions prises</h2><p>${(p.decisions||'-').replace(/\n/g,'<br>')}</p>
      <div class="footer">Édité avec ALLURIEL — Gestion Église premium par NDAGANO</div>
      <script>window.onload=()=>window.print();<\/script>
      </body></html>`);
    w.document.close();
}
