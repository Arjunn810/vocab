const express = require('express');
const cors = require('cors');
const { DBManager } = require('./db-manager');
const dbManager = new DBManager();
const app = express();
const port = 3100;
app.use(cors());
app.use(express.json());

app.get('/vocab/:word', async (req, res) => {
    const word = req.params.word;
    console.log("Vocab GET req for word:", word)
    try {
        const meaning = await dbManager.fetchMeaning(word);
        console.log(meaning);
        res.send(meaning);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.post('/word/', async (req, res) => {
    const body = req.body;
    console.log("/word/ POST Req:", body);
    body.createdOn = Date.now();
    try {
        let result = await dbManager.saveWordToDB(body);
        console.log("/word/ POST Done with:", result);
        res.send(result);
    } catch (error) {
        console.error('Error saving word:', error);
        res.status(500).send('Error saving word');
    }
});

app.put('/word/', async (req, res) => {
    const word = req.body;
    console.log("/word/ PUT Req:", word);

    try {
        let result = await dbManager.updateWordToDB(word);
        console.log("/word/ PUT Done with:", result);
        res.send(result);
    } catch (error) {
        console.error('Error updating word:', error);
        res.status(500).send('Error updating word');
    }
});

app.get('/all/', async (req, res) => {
    console.log("Sending API");
    try {
        let apiRes = await dbManager.getMyVocab();
        res.send(apiRes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.delete('/word/:id', async (req, res) => {
    const id = req.params.id;
    console.log("Delete request for word with ID:", id);
    try {
        const result = await dbManager.deleteWordFromDB(id);
        console.log("Deleted word:", result);
        res.send(result);
    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).send('Error deleting word');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
