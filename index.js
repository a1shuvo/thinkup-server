require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        //  database and collections
        const database = client.db("thinkUp");
        const articlesCollection = database.collection("articles");

        // get all articles and category wise articles
        app.get("/articles", async (req, res) => {
            try {
                const category = req.query.category;
                let query = {};
                if (category) {
                    query.category = category;
                }
                const result = await articlesCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to fetch articles" });
            }
        });

        // get all categories
        app.get("/categories", async (req, res) => {
            const categories = await articlesCollection
                .aggregate([
                    { $group: { _id: "$category" } },
                    { $sort: { _id: 1 } },
                    { $project: { _id: 0, category: "$_id" } },
                ])
                .toArray();
            res.send(categories.map((c) => c.category));
        });

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("ThinkUp is Cooking...");
});

app.listen(port, () => {
    console.log(`ThinkUp Server is listening on port ${port}`);
});
