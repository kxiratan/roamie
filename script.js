// ============================================
// FRONTEND SCRIPT - User Interface Logic
// ============================================
// This runs in the browser and handles:
// 1. Collecting form data
// 2. Sending it to our backend server
// 3. Displaying the generated itinerary

document.getElementById("userInputForm").addEventListener("submit", async function(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();

    // Step 1: Collect selected activities
    const activitySelect = document.getElementById("activity")
    const selectedActivities = [];
    for (let i = 0; i < activitySelect.options.length; i++) {
        if (activitySelect.options[i].selected) {
            selectedActivities.push(activitySelect.options[i].value);
        }
    }

    // Step 2: Collect selected food preferences
    const foodSelect = document.getElementById("food");
    const selectedFoods = [];
    for (let i = 0; i < foodSelect.options.length; i++) {
        if (foodSelect.options[i].selected) {
            selectedFoods.push(foodSelect.options[i].value);
        }
    }

    // Step 3: Create the userData object with all form values
    const userData = {
        origin: document.getElementById("origin").value,
        destination: document.getElementById("destination").value,
        start: document.getElementById("start").value,
        end: document.getElementById("end").value,
        numPeople: document.getElementById("numPeople").value,
        activity: selectedActivities,
        food: selectedFoods
    };

    console.log("User data collected:", userData);

    // Step 4: Store data in sessionStorage and redirect to results page
    sessionStorage.setItem('travelData', JSON.stringify(userData));

    // Redirect to results page
    window.location.href = 'results.html';
});
