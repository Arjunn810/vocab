const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
class DBManager {
    constructor() {
        const uri = "mongodb+srv://arjunlegha810:4eShftH4ztfNTzSi@cluster0.y21ckez.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });
    }

    getCollection = async () => {
        await this.client.connect();
        console.log('Connected successfully to server');
        const db = this.client.db("my-vocab");
        const collection = db.collection('vocab');
        return collection;
    }

    testDb = async () => {
        try {
            await this.client.connect();
            await this.client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } finally {
            await this.client.close();
        }
    }

    fetchMeaning = async (word) => {
        const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=9894c601-aef6-4c2d-ae8e-13729f241ddb`;
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
            throw error;
        }
    }

    saveWordToDB = async (word) => {
        const collection = await this.getCollection();
        const insertResult = await collection.insertOne(word);
        this.client.close();
        console.log('Inserted document:', insertResult);
        return insertResult;
    }

    updateWordToDB = async (word) => {
        const collection = await this.getCollection();
        const id = word.id;
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
            $set: {
                word: word.word,
                pronunciation: word.pronunciation,
                meaning: word.meaning,
                usage: word.usage,
            },
        };
        const result = await collection.updateOne(filter, updateDoc);
        this.client.close();
        console.log('Updated document:', result);
        return result;
    }

    getMyVocab = async () => {
        console.log('Connected successfully to server');
        const collection = await this.getCollection();
        const findResult = await collection.find({}).toArray();

        let wordsList = findResult.map(w => ({
            "id": w._id,
            "word": w.word,
            "meaning": w.meaning,
            "pronunciation": w.pronunciation,
            "usage": w.usage || []
        }));

        this.client.close();
        console.log('Found:', wordsList);
        return wordsList;
    }

    deleteWordFromDB = async (id) => {
        const collection = await this.getCollection();
        const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });
        this.client.close();
        console.log('Deleted document:', deleteResult);
        return deleteResult;
    }

}

module.exports = { DBManager };
