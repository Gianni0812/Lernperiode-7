const API_KEY = "WVbAvQmPysRvVmV1nLBVAWD9P7xJYgU5F9M3E9yp";

document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const input = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  if (!input) {
    resultDiv.innerHTML = "<p>Bitte gib ein Lebensmittel ein.</p>";
    return;
  }

  try {
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(input)}&api_key=${API_KEY}`;
    const searchResp = await fetch(searchUrl);
    if (!searchResp.ok) throw new Error(`Suche fehlgeschlagen: ${searchResp.status}`);
    const searchData = await searchResp.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      resultDiv.innerHTML = `<p>Keine Daten gefunden für: ${input}</p>`;
      return;
    }

    const fdcId = searchData.foods[0].fdcId;
    const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;
    const detailResp = await fetch(detailUrl);
    if (!detailResp.ok) throw new Error(`Detaildaten fehlgeschlagen: ${detailResp.status}`);
    const detailData = await detailResp.json();

    const nutrients = detailData.foodNutrients || [];

    const get = (name) => {
      const found = nutrients.find(n => n.nutrientName && n.nutrientName.toLowerCase().includes(name));
      return found ? `${found.value} ${found.unitName}` : "Keine Angabe";
    };

    const kcal = get("energy");
    const protein = get("protein");
    const fat = get("fat");
    const carbs = get("carbohydrate");

    resultDiv.innerHTML = `
      <div class="analyse">
        <h3>${detailData.description}</h3>
        <p><strong>Kalorien:</strong> ${kcal}</p>
        <p><strong>Fett:</strong> ${fat}</p>
        <p><strong>Eiweiß:</strong> ${protein}</p>
        <p><strong>Kohlenhydrate:</strong> ${carbs}</p>
      </div>
    `;
  } catch (err) {
    resultDiv.innerHTML = `<p>Fehler: ${err.message}</p>`;
    console.error(err);
  }
});
