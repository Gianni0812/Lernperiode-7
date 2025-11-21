const API_KEY = "WVbAvQmPysRvVmV1nLBVAWD9P7xJYgU5F9M3E9yp";


document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const input = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");
  const analyseDiv = document.getElementById("tagesAnalyse");

  const alter = parseInt(localStorage.getItem("alter"));
  const gewicht = parseFloat(localStorage.getItem("gewicht"));
  const groesse = parseFloat(localStorage.getItem("groesse"));
  const sport = parseFloat(localStorage.getItem("sport"));

  if (!alter || !gewicht || !groesse || !sport) {
    analyseDiv.innerHTML = `<p style="color:red;">Bitte zuerst Ihre Angaben auf der Seite „Angaben“ eintragen.</p>`;
    return;
  }

  if (!input) {
    alert("Bitte mindestens ein Lebensmittel mit Menge eingeben (z. B. „100g chicken“).");
    return;
  }

  const items = input.split(",").map(e => e.trim());
  let totalCalories = 0;
  let output = "";

  for (const item of items) {
    const match = item.match(/^(\d+)\s*g\s+(.+)$/i);
    if (!match) {
      output += `<p>${item}: Ungültiges Format (z. B. „100g chicken“).</p>`;
      continue;
    }

    const menge = parseFloat(match[1]);
    const lebensmittel = match[2];

    try {
      const search = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(lebensmittel)}&api_key=${API_KEY}`);
      const searchData = await search.json();
      const food = searchData.foods?.[0];
      if (!food) {
        output += `<p>${lebensmittel.toUpperCase()}: nicht gefunden.</p>`;
        continue;
      }

      const detail = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`);
      const detailData = await detail.json();

      const nutrients = detailData.foodNutrients;

      const kcal = getNutrient(nutrients, "Energy");
      const fat = getNutrient(nutrients, "Total lipid");
      const protein = getNutrient(nutrients, "Protein");
      const carbs = getNutrient(nutrients, "Carbohydrate");

      const cal = kcal * menge / 100;
      const fatVal = fat * menge / 100;
      const protVal = protein * menge / 100;
      const carbVal = carbs * menge / 100;

      totalCalories += cal;

      output += `
        <div>
          <h3>${lebensmittel.toUpperCase()} (${menge}g)</h3>
          <p>Kalorien: ${cal.toFixed(1)} kcal</p>
          <p>Fett: ${fatVal.toFixed(1)} g</p>
          <p>Eiweiß: ${protVal.toFixed(1)} g</p>
          <p>Kohlenhydrate: ${carbVal.toFixed(1)} g</p>
        </div>
      `;
    } catch (err) {
      output += `<p>${lebensmittel.toUpperCase()}: Fehler – ${err.message}</p>`;
    }
  }

  resultDiv.innerHTML = output;

  const bedarf = 2500 - (sport * 100); // einfacher Schätzwert
  analyseDiv.innerHTML = `
    <h3>Analyse heute</h3>
    <p>Insgesamt: ${totalCalories.toFixed(0)} kcal</p>
    <p><strong>${totalCalories < bedarf ? "Du hast noch nicht genug gegessen." : "Du hast genug gegessen."}</strong></p>
  `;
});

function getNutrient(nutrients, name) {
  const found = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return found ? found.value : 0;
}
