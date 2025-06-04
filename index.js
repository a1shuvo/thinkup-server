const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ThinkUp is Cooking...");
});

app.listen(port, () => {
    console.log(`ThinkUp Server is listening on port ${port}`);
});
