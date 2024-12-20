const express = require("express");
const cors = require("cors");
const db = require("./db/db.js");
const addEmp = require("./Controller/auth.js");

require("dotenv").config();
db();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', addEmp);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Started at Port ${PORT}`);
});
