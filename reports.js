// ===== ALLURIEL - reports.js =====
function generateReport(){
    const type = document.getElementById("reportType").value;
    const month = document.getElementById("reportMonth").value; // YYYY-MM
    const year = document.getElementById("reportYear").value;
    let from = null, to = null, label = "Rapport complet";
    if (type === "monthly"){
        if(!month){ alert("⚠️ Sélectionnez un mois"); return; }
        const [y,m] = month.split("-").map(Number);
        from = new Date(y, m-1, 1); to = new Date(y, m, 0, 23,59,59);
        label = "Rapport mensuel — " + month;
    } else if (type === "yearly"){
        if(!year){ alert("⚠️ Année requise"); return; }
        from = new Date(+year, 0, 1); to = new Date(+year, 11, 31, 23,59,59);
        label = "Rapport annuel — " + year;
    }
    const within = (d) => { if(!from) return true; if(!d) return false; const x=new Date(d); return x>=from && x<=to; };

    const fDimes = dimes.filter(x=>within(x.date));
    const fOff = offrandes.filter(x=>within(x.date));
    const fBap = baptemes.filter(x=>within(x.date));
    const fMar = mariages.filter(x=>within(x.date));
    const fInh = cimetiere.filter(x=>within(x.dateInhumation));
    const fDis = (discommunions||[]).filter(x=>within(x.date));
    const fPV = (procesVerbaux||[]).filter(x=>within(x.date));
    const fOe = (oeuvres||[]).filter(x=>within(x.dateDebut));

    const sumD = fDimes.reduce((s,x)=>s+(parseFloat(x.montant)||0),0);
    const sumO = fOff.reduce((s,x)=>s+(parseFloat(x.montant)||0),0);
    const budgetOe = fOe.reduce((s,x)=>s+(parseFloat(x.budget)||0),0);
    const revenuOe = fOe.reduce((s,x)=>s+(parseFloat(x.revenu)||0),0);

    const html = `
    <div class="report">
      <div class="report-header">
        <img src="logo.png" alt="ALLURIEL">
        <div>
          <h1>${currentUser?.egliseName||'Église'}</h1>
          <p>${label} · Édité le ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>

      <h2>Synthèse financière</h2>
      <table class="table">
        <tr><th>Indicateur</th><th>Valeur</th></tr>
        <tr><td>Dîmes (${fDimes.length})</td><td>${formatMoney(sumD)}</td></tr>
        <tr><td>Offrandes (${fOff.length})</td><td>${formatMoney(sumO)}</td></tr>
        <tr><td><strong>Total recettes</strong></td><td><strong>${formatMoney(sumD+sumO)}</strong></td></tr>
        <tr><td>Œuvres : budget engagé</td><td>${formatMoney(budgetOe)}</td></tr>
        <tr><td>Œuvres : revenu généré</td><td>${formatMoney(revenuOe)}</td></tr>
      </table>

      <h2>Vie de l'église</h2>
      <table class="table">
        <tr><th>Activité</th><th>Nombre</th></tr>
        <tr><td>Baptêmes</td><td>${fBap.length}</td></tr>
        <tr><td>Mariages</td><td>${fMar.length}</td></tr>
        <tr><td>Inhumations</td><td>${fInh.length}</td></tr>
        <tr><td>Discommunions / Réintégrations</td><td>${fDis.length}</td></tr>
        <tr><td>Procès-verbaux</td><td>${fPV.length}</td></tr>
        <tr><td>Œuvres sociales/économiques</td><td>${fOe.length}</td></tr>
      </table>

      ${fOe.length?`<h2>Détail des œuvres</h2>
      <table class="table"><thead><tr><th>Projet</th><th>Catégorie</th><th>Resp.</th><th>Budget</th><th>Revenu</th><th>Statut</th></tr></thead><tbody>
      ${fOe.map(o=>`<tr><td>${o.nom}</td><td>${o.categorie}</td><td>${o.responsable}</td><td>${formatMoney(o.budget)}</td><td>${formatMoney(o.revenu)}</td><td>${o.statut}</td></tr>`).join("")}
      </tbody></table>`:''}

      ${fPV.length?`<h2>Procès-verbaux</h2>
      <ul>${fPV.map(p=>`<li><strong>${formatDate(p.date)}</strong> — ${p.titre} (${(p.participants||[]).filter(x=>x.statut==='Présent').length} présents / ${(p.participants||[]).filter(x=>x.statut==='Absent').length} absents)</li>`).join("")}</ul>`:''}

      <div class="report-footer">
        <p>Édité avec <strong>ALLURIEL</strong> · Gestion Église premium par NDAGANO</p>
      </div>
    </div>`;
    document.getElementById("reportContent").innerHTML = html;
}

function printReport(){
    const c = document.getElementById("reportContent");
    if(!c.innerHTML.trim()){ alert("⚠️ Générez d'abord un rapport"); return; }
    const w = window.open("", "_blank", "width=900,height=700");
    w.document.write(`<html><head><title>Rapport ALLURIEL</title>
      <style>
      body{font-family:Arial,sans-serif;padding:30px;color:#222}
      h1{color:#4338ca;margin:0}
      h2{color:#4338ca;margin-top:24px;border-bottom:1px solid #eee;padding-bottom:6px}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{border:1px solid #ccc;padding:8px;text-align:left}
      th{background:#f0f0ff}
      .report-header{display:flex;align-items:center;gap:14px;margin-bottom:20px;border-bottom:2px solid #4338ca;padding-bottom:14px}
      .report-header img{width:70px;height:70px;object-fit:contain}
      .report-footer{margin-top:40px;font-size:12px;color:#888;text-align:center;border-top:1px solid #ddd;padding-top:10px}
      </style></head><body>${c.innerHTML}<script>window.onload=()=>window.print();<\/script></body></html>`);
    w.document.close();
}
