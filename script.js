const container = document.getElementById("committees");
const overallTotal = document.getElementById("overallTotal");

let data = JSON.parse(localStorage.getItem("donationData")) || [];

/* Default 7 committees */
if (data.length === 0) {
  for (let i = 1; i <= 7; i++) {
    data.push({
      name: "கமிட்டி " + i,
      rows: [{ date: "", amount: "" }]
    });
  }
}

function render() {
  container.innerHTML = "";
  let overall = 0;

  data.forEach((c, cIndex) => {
    let total = 0;

    let html = `
    <div class="committee">
      <h3>
        <input value="${c.name}"
        oninput="updateName(${cIndex}, this.value)">
      </h3>

      <table>
        <tr>
          <th>தேதி</th>
          <th>தொகை ₹</th>
        </tr>
    `;

    c.rows.forEach((r, rIndex) => {
      const amt = Number(r.amount || 0);
      total += amt;
      overall += amt;

      html += `
      <tr>
        <td>
          <input type="date" value="${r.date}"
          onchange="updateRow(${cIndex},${rIndex},'date',this.value)">
        </td>
        <td>
          <input type="number" inputmode="numeric"
          value="${r.amount}"
          onchange="updateRow(${cIndex},${rIndex},'amount',this.value)">
        </td>
      </tr>`;
    });

    html += `
      <tr class="total-row">
        <td>மொத்தம்</td>
        <td>₹ ${total}</td>
      </tr>
      </table>

      <button class="add-row"
        onclick="addRow(${cIndex})">➕ Add Day</button>
    </div>
    `;

    container.innerHTML += html;
  });

  overallTotal.innerText = overall;
  save();
}

/* ➕ ADD COMMITTEE */
function addCommittee(){
  const newNo = data.length + 1;
  data.push({
    name: "கமிட்டி " + newNo,
    rows: [{ date:"", amount:"" }]
  });
  render();
}

function updateName(c,val){
  data[c].name = val;
  save();
}

function updateRow(c,r,f,val){
  data[c].rows[r][f] = val;
  render();
}

function addRow(c){
  data[c].rows.push({ date:"", amount:"" });
  render();
}

function save(){
  localStorage.setItem("donationData", JSON.stringify(data));
}

/* Clear with confirmation */
function clearAll(){
  const ok = confirm("⚠️ எல்லா தகவல்களும் அழிக்கப்படும். தொடர விரும்புகிறீர்களா?");
  if(ok){
    localStorage.removeItem("donationData");
    location.reload();
  }
}

/* PDF DOWNLOAD – PERFECT */
function downloadPDF(){
  const pdf = document.getElementById("pdfContent");
  pdf.innerHTML = "";

  data.forEach(c=>{
    const total = c.rows.reduce((s,r)=>s+Number(r.amount||0),0);

    pdf.innerHTML += `
    <div class="pdf-page">
      <h2 style="text-align:center">${c.name}</h2>
      <table>
        <tr><th>தேதி</th><th>தொகை ₹</th></tr>
        ${c.rows.map(r=>`
          <tr>
            <td>${r.date||"-"}</td>
            <td>${r.amount||0}</td>
          </tr>`).join("")}
        <tr class="total-row">
          <td>மொத்தம்</td>
          <td>₹ ${total}</td>
        </tr>
      </table>
    </div>`;
  });

  pdf.innerHTML += `
  <div class="pdf-page pdf-last">
    <h2 style="text-align:center">மொத்த சுருக்கம்</h2>
    <table>
      <tr><th>கமிட்டி</th><th>மொத்தம் ₹</th></tr>
      ${data.map(c=>{
        const t=c.rows.reduce((s,r)=>s+Number(r.amount||0),0);
        return `<tr><td>${c.name}</td><td>₹ ${t}</td></tr>`;
      }).join("")}
      <tr class="total-row">
        <td>மொத்தம்</td>
        <td>₹ ${overallTotal.innerText}</td>
      </tr>
    </table>
  </div>`;

  html2pdf().set({
    margin:8,
    filename:"donation_report.pdf",
    html2canvas:{scale:2,scrollY:0},
    jsPDF:{unit:"mm",format:"a4",orientation:"portrait"}
  }).from(pdf).save();
}

render();
