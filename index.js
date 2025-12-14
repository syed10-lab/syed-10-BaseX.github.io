const express = require("express");
const authRoutes = require("./auth");

const app = express();
app.use(express.json());

authRoutes(app);

app.listen(3000, () => console.log("BaseX Auth running"));
