window.addEventListener("DOMContentLoaded", () => {
  const daten = JSON.parse(localStorage.getItem("tageDaten")) || {};
  const container = document.getElementById("verlaufContainer");

  if (Object.keys(daten).length === 0) {
    container.innerHTML = "<p>Keine Daten vorhanden.</p>";
    return;
  }

  let html = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background-color:#0077cc; color:white;">
          <th style="padding:10px;">Datum</th>
          <th style="padding:10px;">Kalorien</th>
          <th style="padding:10px;">Bedarf</th>
          <th style="padding:10px;">Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  const sortedDates = Object.keys(daten).sort((a, b) => b.localeCompare(a)); 

  for (const tag of sortedDates) {
    const { kalorien, bedarf } = daten[tag];
    const status = kalorien < bedarf ? "Zu wenig" : "OK";
    const farbe = kalorien < bedarf ? "#ffcccc" : "#ccffcc";

    html += `
      <tr style="background-color:${farbe}; text-align:center;">
        <td style="padding:10px;">${tag}</td>
        <td style="padding:10px;">${kalorien.toFixed(0)} kcal</td>
        <td style="padding:10px;">${bedarf.toFixed(0)} kcal</td>
        <td style="padding:10px;">${status}</td>
      </tr>
    `;
  }

  html += "</tbody></table>";
  container.innerHTML = html;
});
