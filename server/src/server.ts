import express from "express";
import { handleQuestion, generateMetadata } from "./prompt-engine";
import { naturalDateFormat, generateRandomDate, toSQLiteDateTime } from "./lib";
import { db } from "./db";
import { embed } from "./openai";
import * as pinecone from "./pinecone";
import { v4 as uuidv4 } from 'uuid';

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
    const id = uuidv4()
    db.prepare('INSERT INTO documents (id, timestamp, metadata, blob) VALUES (?, ?, ?, ?)').run(id, toSQLiteDateTime(randomDay), `Date read: ${naturalDateFormat(randomDay)}. ${metadata}`, blob);
    embed(blob).then((embedding) => {
        pinecone.upsert(id, embedding);
    });
    res.json({
        id,
        timestamp: randomDay,
        metadata,
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});
