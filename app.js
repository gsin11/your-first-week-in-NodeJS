const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

// This is only require on local machine
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const PORT = process.env.PORT || 3000;

// connect to the database
async function connectDB() {
  const { MONGO_USER, MONGO_HOST, MONGO_PASS, MONGO_DB } = process.env;
  await mongoose.connect(
    `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_HOST}/${MONGO_DB}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    }
  );
}

connectDB();

// Create Schema for users
const usersSchema = new mongoose.Schema({
  age: Number,
  name: String,
  email: String,
});

// Create Modal for users
const UsersModal = new mongoose.model("users", usersSchema);

app.set("view engine", "ejs");

app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  if (req.url.includes("/api")) {
    res.append("Content-Type", "text/json");
  }
  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/assets", express.static("assets"));

const getUserInfo = (id) => {
  return USER_DATA.filter((obj) => obj._id === id);
};

// Get list of users, and set data
app.get("/", (req, res) => {
  UsersModal.find({}, function (err, docs) {
    if (err) {
      res.status(500).send(err);
    }
    res.render("index", {
      data: docs,
    });
  });
});

// Get single user by id, and set data
app.get("/user/:id", (req, res) => {
  UsersModal.findOne({ _id: req.params.id }, function (err, doc) {
    if (err) {
      res.status(500).send(err);
    }
    res.render("user", {
      data: doc,
    });
  });
});

// Loading view of contact page
app.get("/contact", (req, res) => {
  res.sendFile(`${__dirname}/contact.html`);
});

// RESTFul API Services

// get all users
app.get("/api/users", (req, res) => {
  UsersModal.find({}, function (err, docs) {
    if (err) {
      res.status(500).send(err);
    }
    res.send(docs);
  });
});

// get single user by id
app.get("/api/user/:id", (req, res) => {
  UsersModal.findOne({ _id: req.params.id }, function (err, doc) {
    if (err) {
      res.status(500).send(err);
    }
    res.send(doc);
  });
});

// delete single user by id
app.delete("/api/user/:id", (req, res) => {
  UsersModal.findOneAndDelete({ _id: req.params.id }, function (err, doc) {
    if (err) {
      res.status(500).send(err);
    }
    res.send(doc);
  });
});

// update single user by id
app.put("/api/user/:id", (req, res) => {
  const { name, age, email } = req.body;
  if (req.params.id) {
    UsersModal.updateOne(
      { _id: req.params.id },
      { name, age, email },
      function (err, doc) {
        if (err) {
          res.status(500).send(err);
        }
        res.send(doc);
      }
    );
  } else {
    res.status(500).send("id is missing in params");
  }
});

// add new user
app.post("/api/user", (req, res) => {
  const { name, age, email } = req.body;

  if (name && age && email) {
    UsersModal.create(
      {
        age,
        name,
        email,
      },
      function (err, doc) {
        if (err) {
          res.status(500).send(err);
        }
        res.send(doc);
      }
    );
  } else {
    res.status(500).send("error, user not added.");
  }
});

app.listen(PORT);
