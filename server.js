const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

let allResponses = [];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Homepage
app.get('/', (req, res) => {
    res.send(`
        <h2>✅ Dynamic API is running</h2>
        <p>POST JSON object or array of objects to <code>/dynamic-format</code></p>
        <p><a href="/form">Open UI to Submit JSON</a></p>
        <p><a href="/view">View All Responses</a></p>
    `);
});

// View all responses
app.get('/view', (req, res) => {
    if (allResponses.length === 0) {
        return res.send('<h3>No POST data received yet.</h3>');
    }

    const formatted = allResponses.map(item => JSON.stringify(item, null, 2)).join('<hr>');
    res.send(`<h3>📄 All Submitted Data:</h3><pre>${formatted}</pre>`);
});

// HTML UI form
app.get('/form', (req, res) => {
    res.send(`
        <h2>🔁 Submit JSON to /dynamic-format</h2>
        <textarea id="jsonInput" rows="10" cols="60">
{
  "userId": 261,
  "id": 101,
  "title": "User 261 Title",
  "body": "User 261 body content for testing purpose."
}
        </textarea><br><br>
        <button onclick="sendData()">Send</button>
        <pre id="responseOutput"></pre>

        <script>
            function sendData() {
                const input = document.getElementById('jsonInput').value;
                try {
                    const json = JSON.parse(input);
                    fetch('/dynamic-format', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(json)
                    })
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('responseOutput').innerText = JSON.stringify(data, null, 2);
                    })
                    .catch(err => {
                        document.getElementById('responseOutput').innerText = '❌ Error: ' + err;
                    });
                } catch (e) {
                    document.getElementById('responseOutput').innerText = '❌ Invalid JSON';
                }
            }
        </script>
    `);
});

// POST endpoint – returns input as-is
app.post('/dynamic-format', (req, res) => {
    const input = req.body;

    if (Array.isArray(input)) {
        if (input.length === 0 || typeof input[0] !== 'object' || input[0] === null) {
            return res.status(400).json({ error: "Invalid JSON object or empty array." });
        }
        allResponses.push(input[0]);
        return res.status(200).json(input[0]); // Return first object only
    }

    if (typeof input !== 'object' || input === null) {
        return res.status(400).json({ error: "Invalid JSON object." });
    }

    allResponses.push(input); // Save original object
    return res.status(200).json(input); // Return original object
});

// Start server
app.listen(port, () => {
    console.log(`✅ Dynamic API running at http://localhost:${port}`);
});
