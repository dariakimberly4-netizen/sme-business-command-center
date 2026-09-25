const roles={
Owner:{modules:["Live Sales","Profit & Expenses","Inventory","People","Approvals","Cash & Bank","Suppliers & Purchasing","Reports"],center:"BUSINESS PULSE",summary:"₱48,650 Today",metrics:[["Sales","₱48,650"],["Profit","₱16,240"],["Alerts","3"]]},
Manager:{modules:["Operations","Staff Scheduling","Inventory","Purchase Orders","Approvals","Reports"],center:"OPERATIONS LIVE",summary:"2 approvals pending",metrics:[["On Shift","8"],["Low Stock","4"],["POs","2"]]},
Cashier:{modules:["POS","Orders","Payments","Discounts","Returns","Shift Reconciliation"],center:"CURRENT SHIFT",summary:"Terminal 01 • Open",metrics:[["Orders","37"],["Sales","₱21,840"],["Returns","1"]]},
Staff:{modules:["Tasks","Attendance","Orders","Stock Requests","Notifications"],center:"MY SHIFT",summary:"Clocked in • 8:03 AM",metrics:[["Tasks","6"],["Done","3"],["Alerts","2"]]}
};const app=document.querySelector("#app");
const DEFAULT_STATE={sales:48650,expenses:12410,profit:17040,cash:18450,alerts:3,lastExpense:null};
function loadState(){try{return Object.assign({},DEFAULT_STATE,JSON.parse(localStorage.getItem("smeState")||"{}"))}catch(e){return {...DEFAULT_STATE}}}
function saveState(st){localStorage.setItem("smeState",JSON.stringify(st))}
function money(n){return "₱"+Number(n||0).toLocaleString()}
function getAudit(){try{return JSON.parse(localStorage.getItem("smeAudit")||"[]")}catch(e){return []}}
function addAudit(action,detail,role){let a=getAudit();a.unshift({action:action,detail:detail,role:role||"Owner",time:new Date().toLocaleString()});localStorage.setItem("smeAudit",JSON.stringify(a.slice(0,50)))}
function openAudit(filter){
 let a=getAudit();if(!a.length)a=[{action:"System Ready",detail:"Audit Trail activated",role:"System",time:new Date().toLocaleString(),target:""}];
 filter=filter||"All";
 let rows=a.filter(x=>filter==="All"||(filter==="Today"&&new Date(x.time).toDateString()===new Date().toDateString())||x.role===filter);
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to Owner Orbit</button><div class="workspace-circle module-demo audit-view"><small>OWNER • CONTROL</small><h2>Audit Trail</h2><div class="audit-filters"><button data-filter="All">All</button><button data-filter="Today">Today</button><button data-filter="Owner">Owner</button><button data-filter="Manager">Manager</button><button data-filter="Cashier">Cashier</button><button data-filter="Staff">Staff</button></div><div class="audit-list">'+rows.map((x,i)=>'<button class="audit-row audit-open" data-i="'+i+'"><div><b>'+x.action+'</b><span>'+x.detail+'</span></div><div class="audit-meta">'+x.role+'<br>'+x.time+'</div></button>').join("")+'</div><button class="action" id="exportAudit">Export Audit Report</button> <button class="action" id="clearAudit">Clear Demo Log</button></div></section></div>';
 document.querySelector(".back").onclick=()=>portal("Owner");
 document.querySelectorAll(".audit-filters button").forEach(b=>b.onclick=()=>openAudit(b.dataset.filter));
 document.querySelectorAll(".audit-open").forEach((b,i)=>b.onclick=()=>openAuditDetail(rows[i]));
 document.querySelector("#exportAudit").onclick=()=>exportAuditReport(a);
 document.querySelector("#clearAudit").onclick=function(){localStorage.removeItem("smeAudit");openAudit()};
}
function openAuditDetail(x){
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Audit Trail</button><div class="workspace-circle module-demo audit-view"><small>AUDIT RECORD</small><h2>'+x.action+'</h2><div class="audit-detail"><p><b>Details</b><br>'+x.detail+'</p><p><b>Role / User</b><br>'+x.role+'</p><p><b>Date & Time</b><br>'+x.time+'</p></div><button class="action primary" id="relatedAudit">Open Related Module</button></div></section></div>';
 document.querySelector(".back").onclick=()=>openAudit();
 document.querySelector("#relatedAudit").onclick=()=>{let t=(x.action||"").toLowerCase();if(t.includes("expense"))openModule("Owner",{dataset:{m:"Profit & Expenses"}});else if(t.includes("purchase"))openModule("Owner",{dataset:{m:"Suppliers & Purchasing"}});else if(t.includes("stock"))openModule("Owner",{dataset:{m:"Inventory"}});else if(t.includes("refund")||t.includes("approval"))openModule("Owner",{dataset:{m:"Approvals"}});else openPulse("Owner")};
}
function exportAuditReport(a){
 let lines=["SME BUSINESS COMMAND CENTER - AUDIT REPORT","Generated: "+new Date().toLocaleString(),"",...a.map(x=>x.time+" | "+x.role+" | "+x.action+" | "+x.detail)];
 let blob=new Blob([lines.join("\n")],{type:"text/plain"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="SME-Audit-Report.txt";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function home(){const entries=Object.entries(roles);app.innerHTML='<div class="shell"><section class="card orbit-first"><div class="orbit role-orbit"><div class="center"><div><strong>COMMAND<br>CENTER</strong><br><span>Choose a role</span></div></div>'+entries.map(([r,d],i)=>'<button class="module role-node" data-role="'+r+'" style="'+pos(i,entries.length)+'">'+r.toUpperCase()+'</button>').join("")+'</div><div class="orbit-caption"><small>SME BUSINESS COMMAND CENTER</small><h1>Choose Your Portal</h1></div></section></div>';document.querySelectorAll("[data-role]").forEach(b=>b.onclick=()=>portal(b.dataset.role))}
function portal(role){let d=roles[role],st=loadState();if(role==="Owner"){d={...d,summary:money(st.sales)+" Today"}}app.innerHTML='<div class="shell"><section class="card portal-orbit-only"><button class="back floating-back">← Roles</button><div class="portal-label"><small>SME COMMAND CENTER</small><h2>'+role+' Portal</h2>'+(role==="Owner"?'<button id="ownerCloseTop" type="button" style="margin-top:10px;background:#00d9ff;color:#00131a;border:4px solid #fff;border-radius:999px;padding:9px 15px;box-shadow:0 0 0 5px #00d9ff,0 0 30px #00d9ff;font-weight:900;font-size:10px;cursor:pointer"><span style="font-size:8px;margin-right:4px">★ NEW</span>END-OF-DAY CLOSING</button>':'')+'</div><div class="orbit"><button class="center center-action" id="orbitCenter" type="button"><div><strong>'+d.center+'</strong><br><span>'+d.summary+'</span><em>Tap for snapshot</em></div></button>'+d.modules.map((m,i)=>'<button class="module'+(role==="Cashier"&&m==="Shift Reconciliation"?' new-feature':'')+'" data-m="'+m+'" style="'+pos(i,d.modules.length)+'">'+m+(role==="Cashier"&&m==="Shift Reconciliation"?'<span class="new-badge">★ NEW</span>':'')+'</button>').join("")+'</div></section></div>';document.querySelector(".back").onclick=home;document.querySelector("#orbitCenter").onclick=()=>openPulse(role);document.querySelectorAll(".module").forEach(b=>b.onclick=()=>openModule(role,b))};const oct=document.querySelector("#ownerCloseTop");if(oct)oct.onclick=()=>{let r=JSON.parse(localStorage.getItem("smeClosing")||"null");closingOwnerReview(r)}
function pos(i,n){let a=(i/n)*Math.PI*2-Math.PI/2,r=41,x=50+r*Math.cos(a),y=50+r*Math.sin(a);return 'left:'+x+'%;top:'+y+'%;transform:translate(-50%,-50%)'}
const ownerViews={
"Live Sales":'<div class="demo-grid"><div><small>TODAY</small><b>₱48,650</b></div><div><small>TRANSACTIONS</small><b>126</b></div><div><small>AVG ORDER</small><b>₱386</b></div></div><p>Recent: #0126 ₱650 • #0125 ₱420 • #0124 ₱1,080</p>',
"Profit & Expenses":'<div class="demo-grid"><div><small>REVENUE</small><b>₱48,650</b></div><div><small>EXPENSES</small><b>₱12,410</b></div><div><small>EST. PROFIT</small><b>₱17,040</b></div></div><button class="action">+ Add Expense</button>',
"Inventory":'<div class="demo-grid"><div><small>PRODUCTS</small><b>186</b></div><div><small>LOW STOCK</small><b>3</b></div><div><small>OUT</small><b>1</b></div></div><p>Milk 4 left • Cups 12 left • Syrup 2 left</p>',
"People":'<div class="demo-grid"><div><small>ON SHIFT</small><b>8</b></div><div><small>ABSENT</small><b>2</b></div><div><small>ATTENDANCE</small><b>96%</b></div></div><p>Top today: Donna • 31 completed tasks</p>',
"Approvals":'<div class="request"><b>Refund #1048 — ₱1,250</b><br><button class="action">Approve</button> <button class="action">Reject</button></div><div class="request"><b>Purchase Request — ₱8,500</b><br><button class="action">Approve</button> <button class="action">Reject</button></div>',
"Cash & Bank":'<div class="demo-grid"><div><small>CASH</small><b>₱18,450</b></div><div><small>GCASH</small><b>₱12,800</b></div><div><small>CARD</small><b>₱17,400</b></div></div><p>Expected ₱18,450 • Actual ₱18,450 • Variance ₱0</p><button class="action">Reconcile Shift</button>',
"Suppliers & Purchasing":'<div class="demo-grid"><div><small>SUPPLIERS</small><b>12</b></div><div><small>OPEN PO</small><b>3</b></div><div><small>PAYABLE</small><b>₱24,600</b></div></div><p>2 deliveries arriving today</p><button class="action">+ Create PO</button>',
"Reports":'<div class="report-modules"><button class="report-module" type="button"><b>Daily Sales</b><span>₱48,650 • 126 transactions</span></button><button class="report-module" type="button"><b>Cash Flow</b><span>In ₱48,650 • Out ₱12,410 • Net ₱36,240</span></button><button class="report-module" type="button"><b>Profit & Loss</b><span>Revenue • COGS • Expenses • Net Profit</span></button><button class="report-module" type="button"><b>Inventory Movement</b><span>Stock In • Stock Out • Adjustments</span></button><button class="report-module" type="button"><b>Expenses</b><span>Today ₱12,410</span></button><button class="report-module" type="button"><b>Exceptions</b><span>2 items need review</span></button></div><a class="action export-link" href="?screen=pdf">Export PDF</a> <a class="action export-link" href="?screen=excel">Export Excel</a>',
"Notification Center":'<div class="alerts-list"><button class="alert-item urgent" data-target="Inventory"><b>Low Stock</b><span>3 products need attention</span></button><button class="alert-item" data-target="Approvals"><b>Approval Required</b><span>2 requests are waiting</span></button><button class="alert-item" data-target="Cash & Bank"><b>Cash Check</b><span>Review today’s reconciliation</span></button><button class="alert-item" data-target="Suppliers & Purchasing"><b>Supplier Delivery</b><span>2 deliveries arriving today</span></button><button class="alert-item" data-target="Profit & Expenses"><b>Expense Activity</b><span>View latest recorded expense</span></button></div>'
};
const roleExamples={
Manager:{
"Operations":'<div class="demo-grid"><div><small>OPEN ORDERS</small><b>14</b></div><div><small>ISSUES</small><b>2</b></div><div><small>ON SHIFT</small><b>8</b></div></div><button class="action">View Operations</button>',
"Staff Scheduling":'<p>Donna 8AM–5PM • Carlo 9AM–6PM • Mia 10AM–7PM</p><button class="action">Reassign Shift</button>',
"Inventory":'<p>Milk 4 left • Cups 12 left • Syrup 2 left</p><button class="action">Stock Count</button>',
"Purchase Orders":'<p>PO-204 ₱8,500 Pending • PO-203 ₱12,300 In Transit</p><button class="action">+ Create PO</button>',
"Approvals":'<p>2 staff requests awaiting approval</p><button class="action">Approve Request</button>',
"Reports":'<p>Branch Sales • Staff • Inventory • Exceptions</p><button class="action">Export Report</button>'},
Cashier:{
"POS":'<p>Iced Coffee ₱180 • Sandwich ₱220 • Cake ₱160</p><button class="action">Add to Cart</button><button class="action">Checkout</button>',
"Orders":'<p>#126 Preparing • #125 Ready • #124 Completed</p><button class="action">Mark Ready</button>',
"Payments":'<p>Total ₱650</p><button class="action">Cash</button> <button class="action">GCash</button> <button class="action">Card</button>',
"Discounts":'<p>Senior • PWD • Promo</p><button class="action">Apply Discount</button>',
"Returns":'<p>Receipt #1048 • ₱1,250</p><button class="action">Process Return</button>',
"Shift Reconciliation":'<p>Expected ₱18,450 • Actual ₱18,450 • Variance ₱0</p><button class="action">Close Shift</button>'},
Staff:{
"Tasks":'<p>Restock cups • Clean counter • Prepare pickup #126</p><button class="action">Complete Task</button>',
"Attendance":'<p>Clocked in 8:03 AM</p><button class="action">Clock Out</button>',
"Orders":'<p>#126 Assigned • Preparing</p><button class="action">Update Status</button>',
"Stock Requests":'<p>Request: Milk × 12</p><button class="action">Submit Request</button>',
"Notifications":'<p>Shift updated • Stock request approved • Manager announcement</p><button class="action">Mark Read</button>'}};
function openPulse(role){
 const data={
  Owner:{title:"Executive Snapshot",items:[["Sales Today",money(loadState().sales)],["Expenses",money(loadState().expenses)],["Est. Profit",money(loadState().profit)],["Alerts",String(loadState().alerts)]],note:"Live values saved on this device"},
  Manager:{title:"Today’s Operations",items:[["On Shift","8"],["Open Orders","14"],["Low Stock","4"],["Approvals","2"]],note:"Operations live"},
  Cashier:{title:"Shift Summary",items:[["Shift Sales","₱21,840"],["Transactions","37"],["Variance","₱0"],["Terminal","01 • Open"]],note:"Current shift"},
  Staff:{title:"My Day",items:[["Clock In","8:03 AM"],["Tasks Left","3"],["Orders","1"],["Alerts","2"]],note:"Shift activity"}
 }[role];
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to '+role+' Orbit</button><div class="workspace-circle module-demo pulse-view"><small>'+role.toUpperCase()+' • ORBIT CENTER</small><h2>'+data.title+'</h2><div class="pulse-grid">'+data.items.map(x=>'<div><small>'+x[0]+'</small><b>'+x[1]+'</b></div>').join("")+'</div>'+(role==="Owner"?'<button class="snapshot-action" id="openNotifications" type="button"><strong>Notification Center</strong><small>3 alerts need attention</small></button><button class="snapshot-action" id="openAudit" type="button"><strong>Audit Trail</strong><small>View business activity history</small></button><button class="snapshot-action owner-closing" id="ownerClosing" type="button"><span class="new-badge">★ NEW</span><strong>End-of-Day Closing</strong><small>Review cashier closing & daily totals</small></button>':'')+'<p>'+data.note+'</p></div></section></div>';
 document.querySelector(".back").onclick=()=>portal(role);const nc=document.querySelector("#openNotifications");if(nc)nc.onclick=()=>openModule("Owner",{dataset:{m:"Notification Center"}});const at=document.querySelector("#openAudit");if(at)at.onclick=openAudit;const oc=document.querySelector("#ownerClosing");if(oc)oc.onclick=()=>{let r=JSON.parse(localStorage.getItem("smeClosing")||"null");if(r)closingOwnerReview(r);else closingOwnerReview(null)};
}
function openModule(role,b){let name=b.dataset.m,st=loadState();if(role==="Owner"&&name==="Cash & Bank"){ownerViews[name]='<div class="demo-grid"><div><small>CASH</small><b>'+money(st.cash)+'</b></div><div><small>GCASH</small><b>₱12,800</b></div><div><small>CARD</small><b>₱17,400</b></div></div><p>Updated from saved business activity</p><button class="action">Reconcile Shift</button>'}if(role==="Owner"&&name==="Reports"){ownerViews[name]=ownerViews[name].replace(/Today ₱[\d,]+/,'Today '+money(st.expenses))}if(role==="Owner"&&name==="Profit & Expenses"){ownerViews[name]='<div class="demo-grid"><div><small>REVENUE</small><b>'+money(st.sales)+'</b></div><div><small>EXPENSES</small><b>'+money(st.expenses)+'</b></div><div><small>EST. PROFIT</small><b>'+money(st.profit)+'</b></div></div>'+(st.lastExpense?'<p>Last expense: '+st.lastExpense.type+' • '+money(st.lastExpense.amount)+'</p>':'')+'<button class="action">+ Add Expense</button>'}let detail=role==="Owner"&&ownerViews[name]?ownerViews[name]:(roleExamples[role]&&roleExamples[role][name]?roleExamples[role][name]:'<p>Sample workspace for '+name+'</p>');app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to '+role+' Orbit</button><div class="workspace-circle module-demo"><small>'+role.toUpperCase()+' WORKSPACE</small><h2>'+name+'</h2>'+detail+'</div></section></div>';document.querySelector(".back").onclick=()=>portal(role);bindActions(role,name);document.querySelectorAll(".alert-item").forEach(a=>a.onclick=()=>openModule("Owner",{dataset:{m:a.dataset.target}}))}
function closingOwnerReview(r){
 if(!r){
  app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to Owner Snapshot</button><div class="workspace-circle module-demo closing-view"><small>OWNER • DAILY CLOSING</small><h2>End-of-Day Closing</h2><div class="closing-empty"><b>Cashier shift is still open</b><p>No completed closing has been submitted yet.</p></div><button class="action" id="viewCashierClose">View Cashier Closing</button></div></section></div>';
  document.querySelector(".back").onclick=()=>openPulse("Owner");document.querySelector("#viewCashierClose").onclick=openClosing;return;
 }
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to Owner Snapshot</button><div class="workspace-circle module-demo closing-view"><small>OWNER • REVIEW</small><h2>Daily Closing Summary</h2><div class="demo-grid"><div><small>SALES</small><b>'+money(r.sales)+'</b></div><div><small>ACTUAL CASH</small><b>'+money(r.actual)+'</b></div><div><small>VARIANCE</small><b>'+(r.variance<0?"-":"")+money(Math.abs(r.variance))+'</b></div></div><div class="closing-summary"><p><b>GCash</b><span>'+money(r.gcash)+'</span></p><p><b>Card</b><span>'+money(r.card)+'</span></p><p><b>Refunds</b><span>'+money(r.refunds)+'</span></p><p><b>Transactions</b><span>'+r.transactions+'</span></p><p><b>Closed by</b><span>'+r.cashier+'</span></p><p><b>Closed at</b><span>'+r.closedAt+'</span></p></div><p class="success-note">✓ Cashier closing received • Audit Trail recorded</p></div></section></div>';
 document.querySelector(".back").onclick=()=>openPulse("Owner");
}
function openClosing(){
 const st=loadState(),saved=JSON.parse(localStorage.getItem("smeClosing")||"null");
 if(saved&&saved.status==="Closed") return closingSummary(saved);
 const expected=18450;
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to Cashier Orbit</button><div class="workspace-circle module-demo closing-view"><small>CASHIER • END OF DAY</small><h2>End-of-Day Closing</h2><div class="demo-grid"><div><small>SHIFT SALES</small><b>₱21,840</b></div><div><small>EXPECTED CASH</small><b>₱18,450</b></div><div><small>TRANSACTIONS</small><b>37</b></div></div><div class="po-form"><label>Actual Cash<input id="closeCash" type="number" value="18450"></label><label>GCash Total<input id="closeGcash" type="number" value="12800"></label><label>Card Total<input id="closeCard" type="number" value="17400"></label><label>Refunds<input id="closeRefund" type="number" value="0"></label><label style="grid-column:1/-1">Closing Notes<textarea id="closeNotes">Shift completed.</textarea></label></div><div class="closing-variance" id="closeVariance">Variance: ₱0</div><button class="action primary" id="submitClosing">Confirm & Close Shift</button></div></section></div>';
 document.querySelector(".back").onclick=()=>portal("Cashier");
 const cash=document.querySelector("#closeCash"),variance=document.querySelector("#closeVariance");
 cash.oninput=()=>{let v=Number(cash.value||0)-expected;variance.textContent="Variance: "+(v<0?"-":"")+money(Math.abs(v));variance.className="closing-variance "+(v===0?"balanced":"warning")};
 document.querySelector("#submitClosing").onclick=function(){
   const actual=Number(cash.value||0),v=actual-expected;
   const rec={status:"Closed",closedAt:new Date().toLocaleString(),cashier:"Cashier • Terminal 01",sales:21840,transactions:37,expected:expected,actual:actual,variance:v,gcash:Number(document.querySelector("#closeGcash").value||0),card:Number(document.querySelector("#closeCard").value||0),refunds:Number(document.querySelector("#closeRefund").value||0),notes:document.querySelector("#closeNotes").value};
   localStorage.setItem("smeClosing",JSON.stringify(rec));addAudit("End-of-Day Closed","Terminal 01 • "+(v===0?"Balanced":("Variance "+(v<0?"-":"")+money(Math.abs(v)))),"Cashier");closingSummary(rec);
 };
}
function closingSummary(r){
 app.innerHTML='<div class="shell"><section class="card workspace"><button class="back orbit-back">← Back to Cashier Orbit</button><div class="workspace-circle module-demo closing-view"><small>SHIFT CLOSED • LOCKED</small><h2>Daily Closing Summary</h2><div class="demo-grid"><div><small>SALES</small><b>'+money(r.sales)+'</b></div><div><small>ACTUAL CASH</small><b>'+money(r.actual)+'</b></div><div><small>VARIANCE</small><b>'+(r.variance<0?"-":"")+money(Math.abs(r.variance))+'</b></div></div><div class="closing-summary"><p><b>GCash</b><span>'+money(r.gcash)+'</span></p><p><b>Card</b><span>'+money(r.card)+'</span></p><p><b>Refunds</b><span>'+money(r.refunds)+'</span></p><p><b>Transactions</b><span>'+r.transactions+'</span></p><p><b>Closed by</b><span>'+r.cashier+'</span></p><p><b>Closed at</b><span>'+r.closedAt+'</span></p></div><p class="success-note">✓ Shift locked and recorded in Audit Trail</p></div></section></div>';
 document.querySelector(".back").onclick=()=>portal("Cashier");
}
function bindActions(role,name){
 const pdf=document.querySelector("#exportPDF"),excel=document.querySelector("#exportExcel");
 if(pdf) pdf.onclick=function(e){e.preventDefault();e.stopPropagation();showExportPreview("PDF")};
 if(excel) excel.onclick=function(e){e.preventDefault();e.stopPropagation();showExportPreview("Excel")};
 document.querySelectorAll(".report-module").forEach(btn=>btn.onclick=function(e){e.preventDefault();reportDetail(role,name,(this.querySelector("b")||this).textContent.trim())});
 document.querySelectorAll(".action:not(.export-btn)").forEach(btn=>btn.onclick=function(){
   let label=this.textContent.trim();
   if(/create\s*p\.?\s*o/i.test(label)) return poForm(role,name);
   if(role==="Owner"&&name==="Profit & Expenses"&&/add expense/i.test(label)) return addExpenseForm();
   if(role==="Cashier"&&name==="Shift Reconciliation"&&/close shift/i.test(label)) return openClosing();
   this.textContent="✓ "+label.replace(/^✓ /,"");this.disabled=true;
 });
}
function addExpenseForm(){
 const el=document.querySelector(".module-demo");
 el.innerHTML='<small>OWNER WORKSPACE</small><h2>Add Expense</h2><div class="po-form"><label>Expense Type<select id="expenseType"><option>Supplies</option><option>Utilities</option><option>Rent</option><option>Payroll</option><option>Other</option></select></label><label>Amount<input id="expenseAmount" type="number" value="850"></label><label>Date<input id="expenseDate" type="date"></label><label>Reference<input id="expenseRef" value="OR-2026-001"></label><label style="grid-column:1/-1">Notes<textarea id="expenseNotes">Business expense</textarea></label></div><button class="action primary" id="saveExpense">Save Expense</button> <button class="action" id="cancelExpense">Cancel</button>';
 document.querySelector("#saveExpense").onclick=function(){
   const amount=Number(document.querySelector("#expenseAmount").value||0);
   const type=document.querySelector("#expenseType").value;
   const st=loadState(),previous=st.expenses;
   st.expenses+=amount;st.profit=Math.max(0,st.profit-amount);st.cash=Math.max(0,st.cash-amount);st.lastExpense={type:type,amount:amount,at:new Date().toISOString()};saveState(st);addAudit("Expense Added",type+" • "+money(amount),"Owner");
   el.innerHTML='<small>EXPENSE RECORDED</small><h2>'+money(amount)+'</h2><span class="status approved">Saved</span><p>'+type+' has been added and synced across the Owner portal.</p><div class="demo-grid"><div><small>PREVIOUS EXPENSES</small><b>'+money(previous)+'</b></div><div><small>UPDATED EXPENSES</small><b>'+money(st.expenses)+'</b></div><div><small>UPDATED PROFIT</small><b>'+money(st.profit)+'</b></div></div><button class="action primary" id="anotherExpense">+ Add Another</button> <button class="action" id="backProfit">← Profit & Expenses</button>';
   document.querySelector("#anotherExpense").onclick=addExpenseForm;
   document.querySelector("#backProfit").onclick=function(){openModule("Owner",{dataset:{m:"Profit & Expenses"}})};
 };
 document.querySelector("#cancelExpense").onclick=function(){openModule("Owner",{dataset:{m:"Profit & Expenses"}})};
}
function poForm(role,name){
 const el=document.querySelector(".module-demo");
 el.classList.add("po-open");
 el.innerHTML='<small>'+role.toUpperCase()+' WORKSPACE</small><h2>Create Purchase Order</h2><div class="po-form"><label>Supplier<input value="Metro Supply Co."></label><label>Item<input value="Premium Coffee Beans"></label><label>Quantity<input type="number" value="20"></label><label>Unit Cost<input type="number" value="425"></label><label>Delivery Date<input type="date"></label><label>Notes<textarea>Restock for next week</textarea></label><button class="action" id="savePO">Create P.O.</button></div>';
 document.querySelector("#savePO").onclick=function(){poCreated(role)};
}
function poCreated(role){addAudit("Purchase Order Created","PO-205 • Metro Supply Co. • ₱8,500",role);
 const el=document.querySelector(".module-demo");
 el.innerHTML='<small>PURCHASE ORDER CREATED</small><h2>PO-205</h2><span class="status pending">Pending Approval</span><p>Metro Supply Co.<br>20 × Premium Coffee Beans<br>Total: ₱8,500</p><div class="po-actions"><button class="action primary" id="submitPO">Submit for Approval</button><button class="action" id="editPO">Edit</button><button class="action danger" id="cancelPO">Cancel</button></div>';
 document.querySelector("#submitPO").onclick=function(){poSubmitted(role)};
 document.querySelector("#editPO").onclick=function(){poForm(role,"Suppliers & Purchasing")};
 document.querySelector("#cancelPO").onclick=function(){portal(role)};
}
function poSubmitted(role){
 const el=document.querySelector(".module-demo");
 el.innerHTML='<small>PURCHASE ORDER</small><h2>PO-205</h2><span class="status submitted">Submitted for Approval</span><p>Metro Supply Co. • ₱8,500</p><button class="action primary" id="openApproval">Open Approval</button>';
 document.querySelector("#openApproval").onclick=function(){approvalPO(role)};
}
function approvalPO(role){
 const el=document.querySelector(".module-demo");
 el.innerHTML='<small>OWNER APPROVAL</small><h2>PO-205</h2><span class="status submitted">Awaiting Decision</span><p>Metro Supply Co.<br>20 × Premium Coffee Beans<br>Total ₱8,500</p><button class="action primary" id="approvePO">Approve P.O.</button> <button class="action danger" id="rejectPO">Reject</button>';
 document.querySelector("#approvePO").onclick=function(){poApproved(role)};
 document.querySelector("#rejectPO").onclick=function(){portal(role)};
}
function poApproved(role){addAudit("Purchase Order Approved","PO-205 • ₱8,500",role);
 const el=document.querySelector(".module-demo");
 el.innerHTML='<small>PURCHASE ORDER</small><h2>PO-205</h2><span class="status approved">Approved</span><p>Ready to send to Metro Supply Co.</p><button class="action primary" id="sendSupplier">Send to Supplier</button>';
 const btn=document.querySelector("#sendSupplier");
 btn.onclick=function(){
   document.querySelector(".status").textContent="Sent to Supplier";
   btn.textContent="Mark In Transit";
   btn.onclick=function(){
     document.querySelector(".status").textContent="In Transit";
     btn.textContent="Mark Received";
     btn.onclick=function(){
       document.querySelector(".status").textContent="Received";
       btn.outerHTML='<p class="success-note">✓ Inventory updated: +20 Premium Coffee Beans</p>';
     };
   };
 };
}
function showExportPreview(type){document.querySelector(".module-demo").innerHTML='<small>OWNER REPORT EXPORT</small><h2>'+type+' Export</h2><div class="report-preview"><div><span>Daily Sales</span><b>₱48,650</b></div><div><span>Transactions</span><b>126</b></div><div><span>Cash Flow</span><b>₱36,240</b></div><div><span>Expenses</span><b>₱12,410</b></div></div><p>Your report is ready.</p><button class="action primary" id="confirmExport">Continue '+type+'</button><button class="action" id="cancelExport">← Reports</button>';document.querySelector("#confirmExport").onclick=()=>exportReport(type.toLowerCase());document.querySelector("#cancelExport").onclick=()=>openReportsAgain()}
function openReportsAgain(){let fake={dataset:{m:"Reports"}};openModule("Owner",fake)}
function exportReport(type){let rows=[["Daily Sales","₱48,650"],["Transactions","126"],["Cash In","₱48,650"],["Cash Out","₱12,410"],["Net Cash Flow","₱36,240"],["Expenses","₱12,410"]];if(type==="excel"){let csv="Report,Value\n"+rows.map(r=>r.join(",")).join("\n");let blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="SME-Owner-Report.csv";document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);return}document.querySelector(".module-demo").innerHTML='<small>PRINTABLE OWNER REPORT</small><h2>Daily Business Report</h2><div class="report-preview">'+rows.map(r=>'<div><span>'+r[0]+'</span><b>'+r[1]+'</b></div>').join("")+'</div><p>Use your browser Print menu and choose Save as PDF.</p><button class="action primary" id="printReport">Print / Save PDF</button><button class="action" id="backReports2">← Reports</button>';document.querySelector("#printReport").onclick=()=>window.print();document.querySelector("#backReports2").onclick=()=>portal("Owner")}
function reportDetail(role,name,label){document.querySelector(".module-demo").innerHTML='<small>OWNER REPORT</small><h2>'+label+'</h2><div class="demo-grid"><div><small>TODAY</small><b>₱48,650</b></div><div><small>YESTERDAY</small><b>₱44,210</b></div><div><small>CHANGE</small><b>+10%</b></div></div><p>Sample detailed '+label+' report.</p><button class="action" id="backReports">← Reports</button>';document.querySelector("#backReports").onclick=()=>portal(role)}
const screen=new URLSearchParams(location.search).get("screen");
if(screen==="pdf"){app.innerHTML='<div class="shell"><section class="card workspace"><div class="workspace-circle module-demo"><small>OWNER REPORT</small><h2>PDF Report</h2><div class="report-preview"><div><span>Daily Sales</span><b>₱48,650</b></div><div><span>Transactions</span><b>126</b></div><div><span>Cash Flow</span><b>₱36,240</b></div><div><span>Expenses</span><b>₱12,410</b></div></div><button class="action primary" onclick="window.print()">Print / Save PDF</button><a class="action export-link" href="./">← Back</a></div></section></div>'}
else if(screen==="excel"){app.innerHTML='<div class="shell"><section class="card workspace"><div class="workspace-circle module-demo"><small>OWNER REPORT</small><h2>Excel Export</h2><div class="report-preview"><div><span>Daily Sales</span><b>₱48,650</b></div><div><span>Transactions</span><b>126</b></div><div><span>Cash Flow</span><b>₱36,240</b></div><div><span>Expenses</span><b>₱12,410</b></div></div><button class="action primary" id="downloadCsv">Download CSV</button><a class="action export-link" href="./">← Back</a></div></section></div>';document.querySelector("#downloadCsv").onclick=()=>{let csv="Report,Value\nDaily Sales,48650\nTransactions,126\nCash Flow,36240\nExpenses,12410";let a=document.createElement("a");a.href="data:text/csv;charset=utf-8,%EF%BB%BF"+encodeURIComponent(csv);a.download="SME-Owner-Report.csv";a.click()}}
else home();