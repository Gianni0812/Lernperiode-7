const API_KEY = "WVbAvQmPysRvVmV1nLBVAWD9P7xJYgU5F9M3E9yp";

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const input = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");
  const analyseDiv = document.getElementById("tagesAnalyse");

  resultDiv.innerHTML = "";
  analyseDiv.innerHTML = "";

  const alter = parseInt(localStorage.getItem("alter"));
  const gewicht = parseFloat(localStorage.getItem("gewicht"));
  const groesse = parseFloat(localStorage.getItem("groesse"));
  const sport = parseFloat(localStorage.getItem("sport"));

  if (!alter || !gewicht || !groesse || !sport) {
    analyseDiv.innerHTML = `<p style="color:red;">Bitte gib zuerst deine Angaben auf der Seite „Angaben“ ein.</p>`;
    return;
  }

  if (!input) {
    resultDiv.innerHTML = `<p style="color:red;">Bitte gib mindestens ein Lebensmittel ein (z. B. „100g chicken“).</p>`;
    return;
  }

  const items = input.split(",").map(e => e.trim());
  let totalCalories = 0;
  let output = "";

  for (const item of items) {
    const match = item.match(/^(\d+)\s*g\s+(.+)$/i);
    if (!match) {
      output += `<p style="color:red;">Eingabeformat falsch bei: <strong>${item}</strong>. Verwende z. B. „100g chicken“.</p>`;
      continue;
    }

    const menge = parseFloat(match[1]);
    const lebensmittel = match[2];

    try {
      const search = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(lebensmittel)}&api_key=${API_KEY}`);
      if (!search.ok) throw new Error(`API-Fehler (Suche): ${search.status}`);
      const searchData = await search.json();

      const food = searchData.foods?.[0];
      if (!food) {
        output += `<p style="color:red;">Keine Ergebnisse gefunden für: <strong>${lebensmittel}</strong></p>`;
        continue;
      }

      const detail = await fetch(`https://api.nal.usda.gov/fdc/v1/food/${food.fdcId}?api_key=${API_KEY}`);
      if (!detail.ok) throw new Error(`API-Fehler (Details): ${detail.status}`);
      const detailData = await detail.json();

      const nutrients = detailData.foodNutrients || [];

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
        <div class="result-block">
          <h3>${lebensmittel.toUpperCase()} (${menge}g)</h3>
          <p>Kalorien: ${cal.toFixed(1)} kcal</p>
          <p>Fett: ${fatVal.toFixed(1)} g</p>
          <p>Eiweiß: ${protVal.toFixed(1)} g</p>
          <p>Kohlenhydrate: ${carbVal.toFixed(1)} g</p>
        </div>
      `;
    } catch (err) {
      output += `<p style="color:red;">Fehler bei ${lebensmittel.toUpperCase()}: ${err.message}</p>`;
    }
  }

  resultDiv.innerHTML = output;

  const bedarf = berechneKalorienbedarf(alter, gewicht, groesse, sport);
  analyseDiv.innerHTML = `
    <h3>Analyse heute</h3>
    <p>Insgesamt: ${totalCalories.toFixed(0)} kcal</p>
    <p>Dein Tagesbedarf: ${bedarf.toFixed(0)} kcal</p>
    <p><strong>${totalCalories < bedarf ? "Du hast noch nicht genug gegessen." : "Du hast genug gegessen!"}</strong></p>
  `;

  const heute = new Date().toISOString().split("T")[0];
  let gespeicherteDaten = JSON.parse(localStorage.getItem("tageDaten")) || {};
  gespeicherteDaten[heute] = {
    kalorien: totalCalories,
    bedarf: bedarf
  };
  localStorage.setItem("tageDaten", JSON.stringify(gespeicherteDaten));
});

function getNutrient(nutrients, name) {
  const found = nutrients.find(n => n.nutrientName.toLowerCase().includes(name.toLowerCase()));
  return found ? found.value : 0;
}

function berechneKalorienbedarf(alter, gewicht, groesse, sportstunden) {
  const grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
  const aktivitaetsfaktor = 1.2 + Math.min(sportstunden * 0.1, 0.7);
  return grundumsatz * aktivitaetsfaktor;
}
