import express from "express";
import axios from 'axios';
import mysql from 'mysql';

import { handleFetchLocalContext, handleFetchMetaContext } from './prompt-engine';

const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("You are listening from express server");
});

app.get("/question", async (req, res) => {
    const connection = mysql.createConnection({
        host: "localhost",
        user: "hack",
        password: "hack",
        database: "hack"
    });

    connection.connect();

    const [localContext, metaContext] = await Promise.all([
        handleFetchLocalContext(),
        handleFetchMetaContext()
    ]);

    connection.end();
});

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
});
