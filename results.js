// ============================================
// RESULTS PAGE SCRIPT - Beginner's Guide
// ============================================
// Welcome! This file handles the results page where your itinerary appears.
// Here's what happens when this page loads:
// 1. Get the travel info you filled out on the form page
// 2. Send that info to our backend server
// 3. The server calls Claude AI to generate your itinerary
// 4. Display the beautiful results on the page!

// ============================================
// STEP 1: Get the Travel Data
// ============================================
// When you clicked "generate itinerary!" on the form page, the data was saved
// in something called "sessionStorage" - think of it like a temporary notebook
// that your browser keeps for a short time.

// sessionStorage.getItem() - asks the browser: "do you have travel data saved?"
// JSON.parse() - converts the saved text back into a usable JavaScript object
const userData = JSON.parse(sessionStorage.getItem('travelData'));

// Quick explanation: What's JSON?
// JSON is a way to save complex data (like your form info) as plain text.
// It looks like this: {"origin":"SFO","destination":"NYC","start":"2025-11-01"}
// We need to "parse" it to turn that text back into data JavaScript can use.

// ============================================
// STEP 2: Find the Important Parts of the Page
// ============================================
// These variables connect our JavaScript to specific parts of the HTML page.
// "document.getElementById()" searches the HTML for an element with that ID.

const loadingDiv = document.getElementById("loadingMessage");
// ^ This is the "Generating your itinerary..." message

const errorDiv = document.getElementById("errorMessage");
// ^ This is where error messages will appear (if something goes wrong)

const resultDiv = document.getElementById("itineraryResult");
// ^ This is the box where your final itinerary will appear

const backButtonContainer = document.getElementById("backButtonContainer");
// ^ This is the "← create new itinerary" button at the bottom

// ============================================
// STEP 3: Safety Check - Do We Have Data?
// ============================================
// What if someone tries to visit this page directly without filling out the form?
// We need to check if we actually have travel data to work with!

if (!userData) {
    // The "!" means "not" - so this checks: "if there is NO user data"
    // If someone came here without filling out the form, send them back!
    window.location.href = 'index.html';
    // ^ This redirects them back to the form page
} else {
    // If we DO have data, let's generate the itinerary!
    generateItinerary(userData);
    // ^ This calls the function below that does all the work
}

// ============================================
// MAIN FUNCTION: Generate Itinerary
// ============================================
// This is the heart of the results page! It talks to our backend server,
// which then talks to Claude AI to create your personalized itinerary.

// "async" means this function will wait for things to finish (like API calls)
// before moving on to the next step
async function generateItinerary(userData) {

    // The "try-catch" block is like a safety net!
    // - "try" means: attempt to do these things
    // - "catch" means: if anything goes wrong, handle the error gracefully

    try {
        // ============================================
        // STEP 4: Send Request to Backend Server
        // ============================================
        console.log("Sending request to backend...");
        // ^ This prints a message in the browser console (for debugging)

        // fetch() is how we talk to our backend server
        // Think of it like sending a letter with your travel info
        const response = await fetch('/generate-itinerary', {
            // "await" means: wait for this to finish before moving forward

            method: 'POST',
            // ^ POST means we're SENDING data to the server (not just asking for data)

            headers: {
                'Content-Type': 'application/json',
                // ^ This tells the server: "Hey, I'm sending you JSON data!"
            },

            body: JSON.stringify(userData)
            // ^ JSON.stringify() converts our userData object back into text
            // ^ so it can be sent over the internet
            // ^ It's the opposite of JSON.parse() we used earlier!
        });

        // ============================================
        // STEP 5: Check if the Request Worked
        // ============================================
        // Did the server respond successfully? Let's check!

        if (!response.ok) {
            // "response.ok" checks if we got a good response (status code 200)
            // If NOT ok, throw an error to stop here and jump to the "catch" block
            throw new Error('Failed to generate itinerary');
        }

        // ============================================
        // STEP 6: Get the Itinerary from the Response
        // ============================================
        // The server sent us back data! Let's extract it.

        const data = await response.json();
        // ^ .json() converts the server's text response back into a JavaScript object
        // ^ Now "data" contains: { success: true, itinerary: "Day 1: ..." }

        console.log("Received itinerary from backend!");
        // ^ Success! Log it to the console

        // ============================================
        // STEP 7: Display the Itinerary on the Page!
        // ============================================
        // Time to show your beautiful itinerary to the world!

        // First, hide the loading message (since we're done loading)
        loadingDiv.style.display = "none";
        // ^ .style.display = "none" makes an element invisible

        // Convert the AI's text into nice HTML and put it in the result box
        resultDiv.innerHTML = formatItinerary(data.itinerary);
        // ^ formatItinerary() is our helper function (see below!)
        // ^ .innerHTML means: put this HTML code inside this element

        // Make the result box visible
        resultDiv.style.display = "block";
        // ^ .style.display = "block" makes an element visible

        // Show the back button so users can create a new itinerary
        backButtonContainer.style.display = "block";

        // ============================================
        // STEP 8: Clean Up
        // ============================================
        // We got our itinerary, so we don't need the saved data anymore
        sessionStorage.removeItem('travelData');
        // ^ This deletes the saved travel data from the browser

    } catch (error) {
        // ============================================
        // ERROR HANDLING
        // ============================================
        // Uh oh! Something went wrong. Let's tell the user nicely.

        console.error("Error:", error);
        // ^ Print the error to the console so developers can debug it

        // Hide the loading message
        loadingDiv.style.display = "none";

        // Show a friendly error message to the user
        errorDiv.innerHTML = `
            <p>Sorry, there was an error generating your itinerary.</p>
            <p>Please go back and try again.</p>
        `;
        // ^ Using backticks (`) lets us write multi-line text easily

        // Make the error message visible
        errorDiv.style.display = "block";

        // Show the back button so they can try again
        backButtonContainer.style.display = "block";
    }
}

// ============================================
// HELPER FUNCTION: Format Itinerary
// ============================================
// The AI returns plain text with markdown formatting (like # for headers)
// This function converts that markdown into proper HTML so it looks pretty!

// Example of what the AI might return:
// "# Trip to NYC\n## Day 1\n- Visit museum\n**Important:** Bring ID"
// We need to convert this to HTML like:
// "<h1>Trip to NYC</h1><h2>Day 1</h2><li>Visit museum</li><h3>Important: Bring ID</h3>"

function formatItinerary(text) {
    // ============================================
    // How This Works (The Big Picture)
    // ============================================
    // 1. Split the text into individual lines
    // 2. Look at each line and figure out what type it is (header? list? paragraph?)
    // 3. Convert it to the appropriate HTML tag
    // 4. Join all the lines back together

    return text
        .split('\n')
        // ^ .split('\n') breaks the text into an array of lines
        // ^ '\n' means "new line" (like pressing Enter)
        // ^ Example: "Line 1\nLine 2" becomes ["Line 1", "Line 2"]

        .map(line => {
            // ^ .map() goes through each line and transforms it
            // ^ It's like a conveyor belt - each line goes in, gets changed, comes out

            // ============================================
            // Check What Type of Line This Is
            // ============================================

            // Is it a Level 3 Header? (### Header)
            if (line.startsWith('### ')) {
                // .startsWith() checks if the line begins with those characters
                return `<h3>${line.replace(/###\s*/g, '')}</h3>`;
                // ^ .replace(/###\s*/g, '') removes all "###" and spaces after them
                // ^ Then we wrap it in <h3> tags to make it a header
                // ^ Example: "### Day 1" becomes "<h3>Day 1</h3>"
            }

            // Is it a Level 2 Header? (## Header)
            else if (line.startsWith('## ')) {
                return `<h2>${line.replace(/##\s*/g, '')}</h2>`;
                // ^ Same idea, but for <h2> (slightly bigger header)
            }

            // Is it a Level 1 Header? (# Header - the biggest!)
            else if (line.startsWith('# ')) {
                return `<h1>${line.replace(/#\s*/g, '')}</h1>`;
                // ^ The biggest header of all!
            }

            // Is it bold text that fills the whole line? (**Bold**)
            else if (line.startsWith('**') && line.endsWith('**')) {
                // .endsWith() checks if the line ends with those characters
                return `<h3>${line.replace(/\*\*/g, '')}</h3>`;
                // ^ .replace(/\*\*/g, '') removes ALL asterisks from the line
                // ^ The "g" means "global" - find all matches, not just the first one
                // ^ Example: "**Important**" becomes "<h3>Important</h3>"
            }

            // Is it a list item? (- Item)
            else if (line.startsWith('- ')) {
                return `<li>${line.replace(/^-\s*/, '')}</li>`;
                // ^ /^-\s*/ means: find a dash at the start (^), followed by spaces (\s*)
                // ^ Example: "- Pack sunscreen" becomes "<li>Pack sunscreen</li>"
            }

            // Is it a horizontal line? (---)
            else if (line.trim() === '---') {
                // .trim() removes spaces from the beginning and end
                return '<hr style="margin: 2rem 0; border: none; border-top: 2px solid #e0e0e0;">';
                // ^ <hr> is a horizontal rule (dividing line)
                // ^ The style makes it look nice with proper spacing and color
            }

            // Is it a regular line with text?
            else if (line.trim()) {
                // .trim() removes extra spaces, then we check if there's anything left
                // ^ If the line is NOT empty after trimming spaces...

                // Handle bold text in the MIDDLE of a line (not the whole line)
                let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // ^ This is more complex! Let's break it down:
                // ^ /\*\*(.*?)\*\*/g finds text between ** and **
                // ^ (.*?) means: capture any characters (that's what the parentheses do)
                // ^ The ? makes it "non-greedy" (stops at the first ** it finds)
                // ^ $1 means: use whatever was captured in the parentheses
                // ^ Example: "This is **bold** text" becomes "This is <strong>bold</strong> text"

                return `<p>${formattedLine}</p>`;
                // ^ Wrap the line in <p> tags to make it a paragraph
            }

            // If the line is empty, return nothing
            return '';
        })

        .join('');
        // ^ .join('') combines all the lines back into one big string
        // ^ The '' means: don't put anything between the lines (no separator)
        // ^ Example: ["<h1>Hi</h1>", "<p>Hello</p>"] becomes "<h1>Hi</h1><p>Hello</p>"
}

// ============================================
// That's It! 🎉
// ============================================
// When this page loads:
// 1. We get your travel data from sessionStorage
// 2. We send it to the backend server
// 3. The server calls Claude AI
// 4. Claude generates an amazing itinerary
// 5. We format it nicely with HTML
// 6. You see your beautiful travel plan!
//
// Questions? Try adding console.log() statements to see what's happening!
// Example: console.log("userData is:", userData);
