//income input confirmation
const incomesInput = document.getElementById("incomes");

incomesInput.addEventListener("input", (event) => {
  const inputText = event.target.value;
  const allowedPattern = /^[\d,]*$/; // Regular expression to allow only numbers and commas

  if (!allowedPattern.test(inputText)) {
    event.preventDefault();
    event.target.value = inputText.replace(/[^0-9,]/g, ""); // Remove any non-numeric or non-comma characters
  }
});
// CalculateDistribution on form submission
let chartInitialized = false;
let myChart; // Declare myChart in the global scope

function calculateDistribution() {
  var fairnessAdjustment = parseFloat(
    document.getElementById("fairnessAdjustment").value
  );
  if (sliderSet) {
    fairnessAdjustment = parseFloat(sliderValue);
    console.log("sliderSet? Yes");
  }

  var estateAmount = document.getElementById("estateAmount").value;
  var incomes = document.getElementById("incomes").value.split(",");
  var incomeNum = incomes.length;
  var totalIncome = 0;
  var incomeShares = [];
  var adjustedIncomeShares = [];
  var normalizedShares = [];
  var individualAllocations = [];

  // Calculate total income
  for (var i = 0; i < incomes.length; i++) {
    var income = parseFloat(incomes[i]);
    totalIncome += income;
  }

  // Calculate income shares
  for (var i = 0; i < incomes.length; i++) {
    var income = parseFloat(incomes[i]);
    var incomeShare = income / totalIncome;
    incomeShares.push(incomeShare);
  }

  // Apply fairness adjustment and (1 - income share) factor
  for (var i = 0; i < incomeShares.length; i++) {
    var adjustedIncomeShare = Math.pow(1 - incomeShares[i], fairnessAdjustment);
    adjustedIncomeShares.push(adjustedIncomeShare);
  }

  // Normalize adjusted income shares
  var sumAdjustedIncomeShares = adjustedIncomeShares.reduce(function (a, b) {
    return a + b;
  }, 0);

  for (var i = 0; i < adjustedIncomeShares.length; i++) {
    var normalizedShare = adjustedIncomeShares[i] / sumAdjustedIncomeShares;
    normalizedShares.push(normalizedShare);
  }

  // Calculate individual allocations
  for (var i = 0; i < normalizedShares.length; i++) {
    var individualAllocation = estateAmount * normalizedShares[i];
    individualAllocations.push(individualAllocation);
  }
  function formatNumberWithCommas(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  // Output individual distributions and create/update the chart
  let output = "";
  var pieResult = [];
  for (var i = 0; i < individualAllocations.length; i++) {
    const incomeNumber = parseFloat(incomes[i]);
    const allocationNumber = parseFloat(individualAllocations[i]);
    output +=
      "Individual " +
      (i + 1) +
      " with income $" +
      formatNumberWithCommas(incomeNumber) +
      ": $" +
      formatNumberWithCommas(allocationNumber) +
      "<br>";
    pieResult.push(Math.floor(individualAllocations[i]));
  }

  document.getElementById("output").innerHTML = output;
  // Generate random background colors
  function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      const color = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
      colors.push(color);
    }
    return colors;
  }
  const backgroundColors = generateRandomColors(incomeNum);
  if (chartInitialized) {
    // Update existing chart
    myChart.data.datasets[0].data = pieResult;
    myChart.update();
  } else {
    // Create new chart
    myChart = new Chart("myChart", {
      type: "pie",
      data: {
        labels: incomes.map(String),
        datasets: [
          {
            backgroundColor: generateRandomColors(incomeNum),
            data: pieResult,
          },
        ],
      },
      options: {
        title: {
          display: true,
          text: "Individual Allocations",
        },
      },
    });

    chartInitialized = true;
  }
  const fullOutputDiv = document.getElementById("fullOutput");
  fullOutputDiv.style.display = "block";
}
function resetVariables() {
  chartInitialized = false;
  myChart = undefined;
}
// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  resetVariables();
  calculateDistribution();
}
// Function to convert logarithmic value to linear value
function logToLinear(value) {
  // Map the slider's 0-2000 range to a logarithmic scale from 0.0 to 20.0
  return Math.pow(10, value / 100) - 1;
}

// Function to convert linear value to logarithmic value
function linearToLog(value) {
  // Map the linear value from 0.0 to 20.0 to the slider's 0-2000 range
  return Math.log10(value + 1) * 100;
}
//UPDATE INFO BASED ON SLIDER
const slider = document.getElementById("fairnessAdjustmentSlider");
const sliderValueDisplay = document.getElementById("sliderValueDisplay");
var sliderSet = false;
var sliderValue;
slider.addEventListener("input", function () {
  sliderValue = this.value;
  // Display "0.0" when the slider is all the way to the left (minimum value)
  sliderValueDisplay.textContent = sliderValue = logToLinear(
    this.value
  ).toFixed(2);
  sliderSet = true;
  calculateDistribution();
});
