const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://arjunlegha810:4eShftH4ztfNTzSi@cluster0.y21ckez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const app = express();
const port = 3100;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

app.get('/vocab/:word', async (req, res) => {
    const word = req.params.word;
    console.log("Vocab GET req for word:", word)
    try {
        const meaning = await fetchMeaning(word);
        console.log(meaning);
        res.send(meaning);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching data');
    }
});

app.post('/word/', async (req, res) => {
    // const parameter = req.params.param;
    body = await req.body
    console.log("/word/ POST Req:", body);
    body.createdOn = Date.now();
    let result = await saveWordToDB(body)
    console.log("/word/ POST Done with:", result);
    res.send(result);
});

app.put('/word/', async (req, res) => {
    // const parameter = req.params.param;
    body = await req.body
    console.log("/word/ PUT Req:", body);
    body.createdOn = Date.now();
    let result = await updateWordToDB(body)
    console.log("/word/ PUT Done with:", result);
    res.send(result);
});


app.get('/all/', async (req, res) => {
    const parameter = req.params.param;
    console.log("Sending API");
    try {
        let apiRes = await getMyVocab()
        res.send(apiRes);

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


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

run().catch(console.dir);


async function saveWordToDB(word) {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db("my-vocab");
    const collection = db.collection('vocab');

    // Insert the object into the collection
    const insertResult = await collection.insertOne(word);

    client.close();

    console.log('Inserted document:', insertResult);

    return insertResult;
}

async function updateWordToDB(word) {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db("my-vocab");
    const collection = db.collection('vocab');

    const id = word.id;
    delete word.id

    const filter = { _id: new ObjectId(id) };
    const result = await collection.updateOne(filter, { $set: word });

    client.close();

    console.log('Ppdated document:', result);

    return result;
}

async function getMyVocab() {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db("my-vocab");
    const collection = db.collection('vocab');

    // Fetch documents from the collection
    const findResult = await collection.find({}).toArray();

    let wordsList = findResult.map(w => ({
        "id": w._id,
        "word": w.word,
        "meaning": w.meaning,
        "pronunciation": w.pronunciation,
        "usage": w.usage || []
    }));

    client.close();

    console.log('Found:', wordsList);

    return wordsList;
}

app.delete('/word/:id', async (req, res) => {
    const id = req.params.id;
    console.log("Delete request for word with ID:", id);

    try {
        const result = await deleteWordFromDB(id);
        console.log("Deleted word:", result);
        res.send(result);
    } catch (error) {
        console.error('Error deleting word:', error);
        res.status(500).send('Error deleting word');
    }
});

async function deleteWordFromDB(id) {
    await client.connect();
    console.log('Connected successfully to server');
    const db = client.db("my-vocab");
    const collection = db.collection('vocab');
    const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

    client.close();

    console.log('Deleted document:', deleteResult);

    return deleteResult;
}