
const APP_ID = "DEINE_APP_ID_HIER";
const APP_KEY = "DEIN_APP_KEY_HIER";

document.getElementById("analyzeBtn").addEventListener("click", function () {
  const input = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!input) {
    alert("Bitte gib mindestens ein Lebensmittel ein!");
    return;
  }

  const zutaten = input.split("\n");

  const url = `https://api.edamam.com/api/nutrition-details?app_id=${APP_ID}&app_key=${APP_KEY}`;

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      title: "Meine Analyse",
      ingr: zutaten
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("API Fehler: " + response.status);
      }
      return response.json();
    })
    .then(data => {
      console.log("Antwort von API:", data);
      const kcal = data.calories;
      const fat = data.totalNutrients.FAT?.quantity.toFixed(1) || 0;
      const protein = data.totalNutrients.PROCNT?.quantity.toFixed(1) || 0;
      const carbs = data.totalNutrients.CHOCDF?.quantity.toFixed(1) || 0;

      resultDiv.innerHTML = `
        <h3>Analyse</h3>
        <p><strong>Kalorien:</strong> ${kcal} kcal</p>
        <p><strong>Fett:</strong> ${fat} g</p>
        <p><strong>Eiweiß:</strong> ${protein} g</p>
        <p><strong>Kohlenhydrate:</strong> ${carbs} g</p>
      `;
    })
    .catch(error => {
      console.error("Fehler beim API-Aufruf:", error);
      resultDiv.innerHTML = "<p style='color:red;'>Fehler beim Abrufen der Daten!</p>";
    });
});
