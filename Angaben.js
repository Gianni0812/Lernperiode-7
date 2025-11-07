document.getElementById("speichernBtn").addEventListener("click", function () {
  const alter = document.getElementById("alter").value;
  const groesse = document.getElementById("groesse").value;
  const gewicht = document.getElementById("gewicht").value;
  const sport = document.getElementById("sport").value;

  const ausgabe = document.getElementById("ausgabe");
  ausgabe.innerHTML = `
    <strong>Deine Angaben:</strong><br>
    Alter: ${alter} Jahre<br>
    Größe: ${groesse} cm<br>
    Gewicht: ${gewicht} kg<br>
    Sport: ${sport} Stunden<br>
  `;

 
});
