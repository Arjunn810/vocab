const express = require('express');
const cors = require('cors'); 
const app = express();
const port = 3100;

app.use(cors()); // Enable CORS for all routes

app.get('/:param', async (req, res) => {
    const parameter = req.params.param;
    console.log("Sending API");
    try {
        const meaning = await fetchMeaning(parameter);
        console.log("Sending API Done ...");
        console.log(meaning);
        res.send(meaning);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

async function fetchMeaning(word) {
    const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=9894c601-aef6-4c2d-ae8e-13729f241ddb`;

    console.log(url);

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log("Got data ...");
        if (data.length > 0 && data[0].shortdef) {
            return ({
                definition: data[0].shortdef,
                pronunciation: data[0].hwi.hw.replaceAll("*", "-")
            });
        } else {
            return `No definition found for ${word}`;
        }
    } catch (error) {
        console.error(error);
        throw error; // This will be caught by the try-catch in the route handler
    }
}


