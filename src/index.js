const express = require("express");
const mongoose = require("mongoose");
//const multer = require('multer');
const app = express();
const route = require("./route/route");

app.use(express.json());
//app.use(multer().any());

mongoose.set("strictQuery", true);
mongoose
    .connect(
        "mongodb+srv://SAURABH:Soa4GdK4yRvlVN5i@cluster0.umtgp.mongodb.net/group5Database",
        { useNewUrlParser: true }
    )
    .then(() => console.log("Connected to database..."))
    .catch((err) => console.log(err));

app.use("/", route);

app.listen(3000, (err) => {
    if (err) console.log(err.message);
    console.log("Application is running on port 3000...");
});