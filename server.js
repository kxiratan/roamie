// ============================================
// BACKEND SERVER - The Brain of Our App
// ============================================
// This file runs on Node.js (not in the browser) and handles:
// 1. Receiving travel data from the frontend
// 2. Calling the AI API securely (with hidden API keys)
// 3. Sending the generated itinerary back to the frontend

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config(); // Loads environment variables from .env file

const app = express();
const PORT = 3000;

// ============================================
// MIDDLEWARE SETUP
// ============================================
// These help Express understand different types of data

// Parse JSON data from requests
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the current directory
app.use(express.static('.'));

// ============================================
// INITIALIZE ANTHROPIC CLIENT
// ============================================
// This creates a connection to Claude AI
// The API key is stored in a .env file (NOT in this code!)
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

// ============================================
// HELPER FUNCTION: Build AI Prompt
// ============================================
// This function takes user data and creates a detailed prompt for Claude
function buildItineraryPrompt(userData) {
    const { origin, destination, start, end, numPeople, activity, food } = userData;

    // Calculate length of stay
    const startDate = new Date(start);
    const endDate = new Date(end);
    const lengthOfStay = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

    // Format the prompt - be specific to get better results!
    return `You are a professional travel planner. Create a detailed, personalized travel itinerary based on the following information:

**Trip Details:**
- Origin: ${origin}
- Destination: ${destination}
- Start Date: ${start}
- End Date: ${end}
- Duration: ${lengthOfStay} days
- Number of Travelers: ${numPeople}
- Activity Preferences: ${activity.join(', ')}
- Food Preferences: ${food.join(', ')}

Please create a comprehensive day-by-day itinerary that includes:
1. Daily activities that match their preferences
2. Restaurant recommendations that align with their food preferences
3. Practical tips (transportation, timing, budget estimates)
4. A balance between activities and rest time

Format the itinerary in a clear, easy-to-read structure with sections for each day.`;
}

// ============================================
// API ENDPOINT: Generate Itinerary
// ============================================
// This is the route that the frontend will call
// POST means the frontend is "sending" data to us

app.post('/generate-itinerary', async (req, res) => {
    try {
        // Step 1: Get user data from the request body
        const userData = req.body;
        console.log('Received user data:', userData);

        // Step 2: Validate that we have all required data
        if (!userData.origin || !userData.destination || !userData.start || !userData.end) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

        // Step 3: Build the prompt for Claude
        const prompt = buildItineraryPrompt(userData);

        // Step 4: Call Claude API
        // This is where the magic happens! We send the prompt to Claude.
        console.log('Calling Claude API...');
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-5-20250929", // The AI model to use
            max_tokens: 4096, // Maximum length of response
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });

        // Step 5: Extract the itinerary from Claude's response
        const itinerary = message.content[0].text;
        console.log('Itinerary generated successfully!');

        // Step 6: Send the itinerary back to the frontend
        res.json({
            success: true,
            itinerary: itinerary
        });

    } catch (error) {
        // If anything goes wrong, log it and send an error response
        console.error('Error generating itinerary:', error);
        res.status(500).json({
            error: 'Failed to generate itinerary',
            details: error.message
        });
    }
});

// ============================================
// START THE SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📝 Open your browser to see the app!`);
});
