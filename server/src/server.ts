import express from "express";
import { handleQuestion, generateMetadata } from "./prompt-engine";
import { naturalDateFormat, generateRandomDate, toSQLiteDateTime } from "./lib";
import { db } from "./db";

const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("You are listening from express server");
});

app.post("/question", async (req, res) => {
    const { question, context } = req.body
    const response = await handleQuestion(question, context);
    res.send(response);
});

app.post('/read', async (req, res) => {
    const { blob } = req.body;
    const randomDay = generateRandomDate();
    const metadata = await generateMetadata(blob, naturalDateFormat(randomDay));
    db.prepare('INSERT INTO documents (timestamp, metadata, blob) VALUES (?, ?, ?)').run(toSQLiteDateTime(randomDay), `Date read: ${naturalDateFormat(randomDay)}. ${metadata}`, blob);
    res.json({
        timestamp: randomDay,
        metadata,
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});
