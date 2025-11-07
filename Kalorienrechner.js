const API_KEY = "DEMO_KEY";

document.getElementById("analyzeBtn").addEventListener("click", function () {
  const input = document.getElementById("foodInput").value.trim();
  const resultDiv = document.getElementById("result");

  if (!input) {
    alert("Bitte gib ein Lebensmittel ein!");
    return;
  }

  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(input)}&api_key=${API_KEY}`;

  fetch(searchUrl)
    .then(response => {
      if (!response.ok) throw new Error(response.status);
      return response.json();
    })
    .then(data => {
      if (!data.foods || data.foods.length === 0) {
        resultDiv.innerHTML = `<p>Kein Lebensmittel gefunden für "${input}".</p>`;
        return;
      }

      const food = data.foods[0];
      const fdcId = food.fdcId;
      const foodName = food.description;

      const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${API_KEY}`;

      return fetch(detailUrl)
        .then(response => {
          if (!response.ok) throw new Error(response.status);
          return response.json();
        })
        .then(detailData => {
          const nutrients = detailData.foodNutrients;

          const kcal = getNutrient(nutrients, "energy");
          const fat = getNutrient(nutrients, "fat");
          const protein = getNutrient(nutrients, "protein");
          const carbs = getNutrient(nutrients, "carbohydrate");

          resultDiv.innerHTML = `
            <h3>${foodName}</h3>
            <p>Kalorien: ${kcal} kcal</p>
            <p>Fett: ${fat} g</p>
            <p>Eiweiß: ${protein} g</p>
            <p>Kohlenhydrate: ${carbs} g</p>
          `;

          document.getElementById("todayCalories").textContent = `${kcal} kcal`;
          document.getElementById("todayCarbs").textContent = `${carbs} g`;
          document.getElementById("todayProtein").textContent = `${protein} g`;

          const expected = 2500;
          let warnText = "";
          if (kcal !== "nicht gefunden" && !isNaN(kcal)) {
            if (kcal < expected) {
              warnText = `Sie essen zu wenig. Erwartet: ${expected}, erreicht: ${kcal}`;
            } else {
              warnText = `Sie essen genug. Erwartet: ${expected}, erreicht: ${kcal}`;
            }
          }

          document.getElementById("warnung").textContent = warnText;
        });
    })
    .catch(error => {
      resultDiv.innerHTML = `<p style="color:red;">Fehler: ${error.message}</p>`;
    });
});

function getNutrient(nutrients, keyword) {
  const found = nutrients.find(n =>
    n.nutrientName.toLowerCase().includes(keyword.toLowerCase())
  );
  return found ? found.value : "nicht gefunden";
}
