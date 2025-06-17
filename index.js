require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 3000;

// Firebase admin
const admin = require("firebase-admin");
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

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

// firebase admin initialize
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.decoded = decoded;
        next();
    } catch (error) {
        return res.status(401).send({ message: "Unauthorized Access" });
    }
};

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        //  database and collections
        const database = client.db("thinkUp");
        const articlesCollection = database.collection("articles");
        const commentsCollection = database.collection("comments");

        // Custom middleware wrapper if author_id in the query
        const verifyIfAuthorId = (req, res, next) => {
            if (req.query.author_id) {
                verifyFirebaseToken(req, res, next);
            } else {
                next();
            }
        };

        // get all articles and category wise articles
        app.get("/articles", verifyIfAuthorId, async (req, res) => {
            try {
                const category = req.query.category;
                const author_id = req.query.author_id;
                let query = {};
                if (category) {
                    query.category = category;
                }
                if (author_id) {
                    query.author_id = author_id;
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

        // POST a article
        app.post("/article", verifyFirebaseToken, async (req, res) => {
            const newArticle = req.body;
            try {
                const result = await articlesCollection.insertOne(newArticle);
                res.send(result);
            } catch (error) {
                console.error("Error posting article:", error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // PUT/UPDATE a article
        app.put("/article/:id", verifyFirebaseToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedArticle = req.body;
            const updateDoc = {
                $set: updatedArticle,
            };
            const result = await articlesCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.send(result);
        });

        // DELETE a article
        app.delete("/article/:id", verifyFirebaseToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await articlesCollection.deleteOne(query);
            res.send(result);
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
        app.post("/comments", verifyFirebaseToken, async (req, res) => {
            const comment = req.body;
            try {
                const result = await commentsCollection.insertOne(comment);
                res.send(result);
            } catch (error) {
                console.error("Error posting comment:", error);
                res.status(500).send({ message: "Server error" });
            }
        });

        // PATCH /article/like/:id
        app.patch(
            "/article/like/:id",
            verifyFirebaseToken,
            async (req, res) => {
                const articleId = req.params.id;
                const userId = req.body.userId;

                if (!userId) {
                    return res
                        .status(400)
                        .send({ message: "User ID is required" });
                }

                const article = await articlesCollection.findOne({
                    _id: new ObjectId(articleId),
                });

                if (!article) {
                    return res
                        .status(404)
                        .send({ message: "Article not found" });
                }

                const hasLiked = article.likedUsers?.includes(userId);

                let updateQuery;
                if (hasLiked) {
                    // Unlike
                    updateQuery = {
                        $pull: { likedUsers: userId },
                        $inc: { totalLikes: -1 },
                    };
                } else {
                    // Like
                    updateQuery = {
                        $addToSet: { likedUsers: userId },
                        $inc: { totalLikes: 1 },
                    };
                }

                await articlesCollection.updateOne(
                    { _id: new ObjectId(articleId) },
                    updateQuery
                );

                const updatedArticle = await articlesCollection.findOne({
                    _id: new ObjectId(articleId),
                });

                res.send({
                    message: hasLiked ? "Unliked" : "Liked",
                    totalLikes: updatedArticle.totalLikes,
                    liked: !hasLiked,
                });
            }
        );

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
