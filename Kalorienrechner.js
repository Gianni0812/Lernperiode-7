const API_KEY = "WVbAvQmPysRvVmV1nLBVAWD9P7xJYgU5F9M3E9yp";

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const foodInput = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");
  const analyseDiv = document.getElementById("tagesAnalyse");

  const alter = parseInt(localStorage.getItem("alter"), 10);
  const gewicht = parseFloat(localStorage.getItem("gewicht"));
  const groesse = parseFloat(localStorage.getItem("groesse"));
  const sport = parseFloat(localStorage.getItem("sport"));

  if (isNaN(alter) || isNaN(gewicht) || isNaN(groesse) || isNaN(sport)) {
    analyseDiv.innerHTML = `<p style="color:red;">Bitte zuerst Ihre Angaben auf der Seite „Angaben“ eintragen.</p>`;
    return;
  }

  if (!foodInput) {
    alert("Bitte mindestens ein Lebensmittel mit Menge eingeben (z. B. „100g chicken“).");
    return;
  }

  const items = foodInput.split(",").map(s => s.trim());
  let kalorienGesamt = 0;
  let resultHTML = "";

  for (const item of items) {
    const match = item.match(/^(\d+(?:\.\d+)?)\s*g\s*(.+)$/i);
    if (!match) {
      resultHTML += `<p>${item.toUpperCase()}: Format ungültig (z. B. „100g chicken“).</p>`;
      continue;
    }

    const menge = parseFloat(match[1]);
    const lebensmittel = match[2];

    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(lebensmittel)}&api_key=${API_KEY}`;
    try {
      const searchResp = await fetch(searchUrl);
      if (!searchResp.ok) throw new Error(`Suche fehlerhaft: ${searchResp.status}`);
      const searchData = await searchResp.json();
      if (!searchData.foods || searchData.foods.length === 0) {
        resultHTML += `<p>${lebensmittel.toUpperCase()}: nicht gefunden.</p>`;
        continue;
      }

      const food = searchData.foods[0];
      const fdcId = food.fdcId;

      const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
      const detailResp = await fetch(detailUrl);
      if (!detailResp.ok) throw new Error(`Details fehlerhaft: ${detailResp.status}`);
      const detailData = await detailResp.json();

      const nutrients = detailData.foodNutrients || [];

      const kcalPer100g = (() => {
        const n = nutrients.find(nu => nu.nutrientName && nu.nutrientName.toLowerCase().includes("energy"));
        return n ? n.value : 0;
      })();

      const kcalItem = (kcalPer100g * menge / 100);
      kalorienGesamt += kcalItem;

      resultHTML += `
        <div>
          <h3>${lebensmittel.toUpperCase()} (${menge} g)</h3>
          <p>Kalorien: ${kcalItem.toFixed(1)} kcal</p>
        </div>
      `;
    } catch (error) {
      resultHTML += `<p>${item.toUpperCase()}: Fehler (${error.message}).</p>`;
    }
  }

  resultDiv.innerHTML = resultHTML;

  const grundumsatz = 10 * gewicht + 6.25 * groesse - 5 * alter + 5;
  let faktor = 1.2;
  if (sport > 0 && sport <= 3) faktor = 1.375;
  else if (sport > 3 && sport <= 5) faktor = 1.55;
  else if (sport > 5) faktor = 1.725;
  const tagesbedarf = Math.round(grundumsatz * faktor);

  analyseDiv.innerHTML = `
    <p><strong>Dein Tagesbedarf:</strong> ${tagesbedarf} kcal</p>
    <p><strong>Gegessen:</strong> ${kalorienGesamt.toFixed(1)} kcal</p>
    <p><strong>Ergebnis:</strong> ${kalorienGesamt >= tagesbedarf
      ? '✅ Du hast genug gegessen!'
      : `⚠️ Du hast zu wenig gegessen (${(tagesbedarf - kalorienGesamt).toFixed(1)} kcal fehlen)`}</p>
  `;
});

