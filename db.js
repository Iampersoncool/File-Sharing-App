const mongoose = require("mongoose");

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on("error", (err) => console.log(err));
db.on("open", () => console.log("connected to db."));

// module.exports = db;
