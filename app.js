const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Serve static files from the public directory
app.use("/trivia", express.static(path.join(__dirname, 'js'), {}));

// json body parser
app.use(express.json());
// urlencoded body parser
app.use(express.urlencoded({ extended: false }));
// cookie parser
app.use(cookieParser());

const triviaRoute = express.Router();
app.use("/trivia", triviaRoute);

app.use((req, res) => {
    res.redirect(`/trivia${req.originalUrl}`);
});

// Serve index.html as the main page
triviaRoute.get('/', (req, res) => {
    console.log(req.cookies);
    if (req.cookies && req.cookies.name && req.cookies.age) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'login.html'));
    }
});

triviaRoute.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// Test database connection
triviaRoute.get('/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM trv_questions ORDER BY random() limit 10;');
        const Questions = [];
        if (result.rows.length > 0) {

            for (i = 0; i < result.rows.length; i++) {
                const AnswerHash = await hashAnswer(result.rows[i].answer.toLowerCase());
                const AnswerClue = generateClue(result.rows[i].answer);
                Questions.push({
                    QuestionText: result.rows[i].question,
                    AnswerClue,
                    AnswerHash,
                    answer: result.rows[i].answer.toLowerCase()
                });
            }
        }
        res.json({ success: true, Questions: Questions });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


// Test database connection
triviaRoute.get('/data/getScores', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, score FROM trv_scores ORDER BY score DESC limit 10;');
        res.json({ success: true, result: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Serve index.html as the main page
triviaRoute.post('/validate-score', async (req, res) => {
    console.log(req.body);
    if (req.cookies && req.cookies.name && req.cookies.age) {
        try {
            const query = `
                INSERT INTO trv_scores (name, age, score) 
                VALUES ($1, $2, $3) RETURNING *;
            `;

            const values = [req.cookies.name, req.cookies.age, req.body.score];

            const result = await pool.query(query, values);
            console.log("Inserted:", result.rows[0]);
        } catch (error) {
            console.error("Database Error:", error);
            throw error;
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// This function hashes the answer using SHA-256 (async)
const hashAnswer = async (answer) => {
    const encoder = new TextEncoder();   // Encode the answer string as bytes
    const data = encoder.encode(answer);  // Create a byte array from the answer

    // Hash the byte array using SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert the hash buffer to a hex string
    return arrayBufferToHex(hashBuffer);
}

// Helper function to convert ArrayBuffer to hex string
function arrayBufferToHex(buffer) {
    const byteArray = new Uint8Array(buffer);
    let hexString = '';
    byteArray.forEach(byte => {
        hexString += byte.toString(16).padStart(2, '0');
    });
    return hexString;
}

const generateClue = (answer) => {
    const chars = answer.split('');
    const regex = /[a-zA-Z0-9]/;
    const revealableIndexes = chars
        .map((char, index) => (regex.test(char) ? index : null))
        .filter(index => index !== null);

    const revealCount = Math.max(1, Math.floor(revealableIndexes.length * 0.3)); // Reveal about 30% of non-space characters
    const revealIndexes = new Set();

    while (revealIndexes.size < revealCount) {
        revealIndexes.add(revealableIndexes[Math.floor(Math.random() * revealableIndexes.length)]);
    }

    return chars.map((char, index) => (!regex.test(char) || revealIndexes.has(index)) ? char : '_').join('');
};