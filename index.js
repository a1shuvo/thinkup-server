require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
        const commentsCollection = database.collection("comments");

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

        // get a single article
        app.get("/article/:id", async (req, res) => {
            const id = req.params.id;
            const article = await articlesCollection.findOne({
                _id: new ObjectId(id),
            });
            if (!article) {
                return res.status(404).send({ message: "Article not found" });
            }
            res.send(article);
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

        // GET comments by article ID
        app.get("/comments/:articleId", async (req, res) => {
            const articleId = req.params.articleId;

            try {
                const comments = await commentsCollection
                    .find({ article_id: articleId })
                    .sort({ _id: -1 })
                    .toArray();
                res.send(comments);
            } catch (error) {
                console.error("Error fetching comments:", error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // POST a comment
        app.post("/comments", async (req, res) => {
            const comment = req.body;
            try {
                const result = await commentsCollection.insertOne(comment);
                res.send(result);
            } catch (error) {
                console.error("Error posting comment:", error);
                res.status(500).send({ message: "Server error" });
            }
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
