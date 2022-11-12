if (process.env.NODE_ENV !== "production") require("dotenv").config();

const { getUserInfo } = require("@replit/repl-auth");
const express = require("express");
const multer = require("multer");
const Files = require("./Files");
const path = require("path");
const productionCode = require("./productionCode");

require("./db");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));

if (process.env.NODE_ENV === "production") {
  productionCode(app);
}

const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 41943040, //40 megabytes
  },
});
const PORT = process.env.PORT || 3000;

console.log("NODE_ENV: " + process.env.NODE_ENV);

app.get("/", async (req, res) => {
  const files = await Files.find();
  res.render("index", { files });
});

app.get("/logout", (req, res) => {
  res.clearCookie("REPL_AUTH", { path: "/", domain: req.headers.host });

  res.redirect("/admin");
});

// app.get("/admin", async (req, res) => {
//   const user = getUserInfo(req);
//   const authorized = user?.id === process.env.OWNER_USER_ID;
//   const files = authorized ? await Files.find({}, { __id: 0, __v: 0 }) : null;

//   res.render("showAll", {
//     files,
//     authorized,
//   });
// });

app.post("/db/update", async (req, res) => {
  const user = getUserInfo(req);
  const authorized = user?.id === process.env.OWNER_USER_ID;

  if (!authorized) return res.status(401).send("Unauthorized");

  const parsedJSON = JSON.parse(req.body.value);

  await Promise.all(
    parsedJSON.map(async ({ originalFileName, path, uuid }) => {
      await Files.updateOne(
        { uuid },
        {
          originalFileName,
          path,
          uuid,
        }
      );
    })
  );

  res.redirect("/admin");
});

app.post("/upload/new", (req, res) => {
  upload.single("uploadedFile")(req, res, async (err) => {
    if (err) return res.status(500).send("Internal server error");

    const { filename, originalname } = req.file;

    const createdFile = await Files.create({
      originalFileName: originalname,
      path: filename,
    });

    res.render("download", {
      fileName: createdFile.originalFileName,
      link: `https://${req.headers.host}/files/${createdFile.uuid}`,
    });
  });
});

app.get("/files/:id", async (req, res) => {
  try {
    const file = await Files.findOne({
      uuid: req.params.id,
    });

    res.download(`./uploads/${file.path}`, file.originalFileName);
  } catch (e) {
    res.status(404).send("File Not Found.");
  }
});

app.listen(PORT, () => console.log(`app listening on port ${PORT}`));
