
const button = document.getElementById("analyzeBtn");


button.addEventListener("click", function() {
  
  const eingabe = document.getElementById("foodInput").value;

  
  document.getElementById("result").innerHTML = "Du hast eingegeben: <strong>" + eingabe + "</strong>";
});

