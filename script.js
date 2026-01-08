const committeeCount = 7;
const container = document.getElementById("committees");
const overallTotal = document.getElementById("overallTotal");

/* Load data */
let data = JSON.parse(localStorage.getItem("donationData")) || [];

/* Initial committees */
if (data.length === 0) {
  for (let i = 1; i <= committeeCount; i++) {
    data.push({
      name: "கமிட்டி " + i,
      rows: [{ date: "", amount: "" }]
    });
  }
}

/* Render UI */
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
      </tr>
      `;
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

/* Update committee name */
function updateName(cIndex, value) {
  data[cIndex].name = value;
  save();
}

/* Update row data */
function updateRow(cIndex, rIndex, field, value) {
  data[cIndex].rows[rIndex][field] = value;
  render();
}

/* Add new row */
function addRow(cIndex) {
  data[cIndex].rows.push({ date: "", amount: "" });
  render();
}

/* Save to localStorage */
function save() {
  localStorage.setItem("donationData", JSON.stringify(data));
}

/* Clear all with confirmation */
function clearAll() {
  const ok = confirm(
    "⚠️ எல்லா நன்கொடை தகவல்களும் நீக்கப்படும்.\nதொடர விரும்புகிறீர்களா?"
  );

  if (ok) {
    localStorage.removeItem("donationData");
    location.reload();
  }
}

/* Download PDF */
function downloadPDF() {
  const pdf = document.getElementById("pdfContent");
  pdf.innerHTML = "";

  data.forEach((c) => {
    const total = c.rows.reduce(
      (s, r) => s + Number(r.amount || 0),
      0
    );

    pdf.innerHTML += `
    <div class="pdf-page">
      <h2 style="text-align:center">${c.name}</h2>
      <table>
        <tr>
          <th>தேதி</th>
          <th>தொகை ₹</th>
        </tr>
        ${c.rows
          .map(
            (r) => `
          <tr>
            <td>${r.date || "-"}</td>
            <td>${r.amount || 0}</td>
          </tr>`
          )
          .join("")}
        <tr class="total-row">
          <td>மொத்தம்</td>
          <td>₹ ${total}</td>
        </tr>
      </table>
    </div>
    `;
  });

  /* Final summary page */
  pdf.innerHTML += `
  <div class="pdf-page pdf-last">
    <h2 style="text-align:center">மொத்த சுருக்கம்</h2>
    <table>
      <tr>
        <th>கமிட்டி</th>
        <th>மொத்தம் ₹</th>
      </tr>
      ${data
        .map((c) => {
          const t = c.rows.reduce(
            (s, r) => s + Number(r.amount || 0),
            0
          );
          return `<tr><td>${c.name}</td><td>₹ ${t}</td></tr>`;
        })
        .join("")}
      <tr class="total-row">
        <td>மொத்தம்</td>
        <td>₹ ${overallTotal.innerText}</td>
      </tr>
    </table>
  </div>
  `;

  html2pdf()
    .set({
      margin: 8,
      filename: "donation_report.pdf",
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    })
    .from(pdf)
    .save();
}

/* Initial render */
render();
