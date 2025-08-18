const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const cors = require("cors");
const CreateForm = require("./models/Forms");
const FormResponse = require("./models/FormResponse");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// cors
const corsOptions = {
  origin: "http://localhost:5173", // allow Vite/React frontend
  credentials: true, // if you're sending cookies (optional)
};
app.use(cors(corsOptions)); // enable CORS for that domain
app.use(express.json());
// for Uploading file
app.use("/uploads", express.static("public/uploads"));

mongoose
  .connect(
    "mongodb+srv://test:test1234@cluster0.x43f49z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection:", err.message));

// Example route
app.get("/", (req, res) => {
  res.send("MongoDB + Express Connected!");
});

app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
});

// for uploading file to uplaods
const uploadBaseDir = "uploads";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.body.userId;
    const formId = req.body.formId;

    if (!userId || !formId) {
      return cb(new Error("Missing userId or formId"), "");
    }

    const userFolder = path.join(uploadBaseDir, userId);
    const formFolder = path.join(userFolder, formId);

    // Create directories if they don't exist
    if (!fs.existsSync(userFolder)) {
      fs.mkdirSync(userFolder);
    }
    if (!fs.existsSync(formFolder)) {
      fs.mkdirSync(formFolder);
    }

    cb(null, formFolder);
  },

  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  },
});

const uploadMultiple = multer({ storage });

app.post("/upload-multiple", uploadMultiple.array("myFiles"), (req, res) => {
  const { userId, formId } = req.body;

  if (!userId || !formId) {
    return res.status(400).json({ error: "Missing userId or formId" });
  }

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No files uploaded." });
  }

  const uploadedFiles = req.files.map((file) => ({
    originalName: file.originalname,
    savedAs: file.filename,
    fileId: file.filename.split(".")[0],
    path: `/uploads/${userId}/${formId}/${file.filename}`,
  }));

  res.json({
    message: "Files uploaded successfully",
    files: uploadedFiles,
  });
});

// get file route
app.get("/file/:userId/:formId/:filename", (req, res) => {
  const { userId, formId, filename } = req.params;
  const filePath = path.join(__dirname, "uploads", userId, formId, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.sendFile(filePath);
});

// all user routes
app.post("/users", async (req, res) => {
  try {
    const { name, email, gender, password } = req.body;
    const user = new User({ name, email, gender, password });
    if (user) {
      const saved = await user.save();
      res.status(201).json(saved);
    }
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/user", async (req, res) => {
  const { email } = req.query;
  const users = await User.find(email ? { email } : {});
  res.json(users);
});
app.get("/getuserbyid", async (req, res) => {
  const { id } = req.query;
  const users = await User.find({ _id: id });
  res.json(users);
});

app.post("/createform", async (req, res) => {
  try {
    const data = req.body;

    const normalizedSections = data.sections.map((section, i) => ({
      id: section.id ?? `section_${i + 1}`,
      name: section.name?.trim(),
      description: section.description ?? "",
      fields: (section.fields || []).map((f, j) => ({
        id: f.field_id ?? `field_${j + 1}`,
        label: f.label?.trim(),
        type: f.type,
        length: f.length,
        required: f.required !== undefined ? f.required : true,
        options: (f.options || []).map((o) => o.value).filter((v) => v.trim()),
      })),
    }));

    const form = new CreateForm({
      title: data.title,
      userId: data.userId,
      description: data.description,
      sections: normalizedSections,
    });

    await form.save();

    return res.status(201).json({ message: "Form created", form });
  } catch (err) {
    console.error("Error in /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/deleteform/:id", async (req, res) => {
  const formId = req.params.id;

  // Validate ObjectId before querying
  if (!mongoose.Types.ObjectId.isValid(formId)) {
    return res.status(400).json({ message: "Invalid form ID" });
  }

  try {
    const deletedForm = await CreateForm.findByIdAndDelete(formId);

    if (!deletedForm) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.status(200).json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/getformbyuserid", async (req, res) => {
  try {
    const userId = req.query.userId;
    const forms = await CreateForm.find({ userId: userId });
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.get("/getformbyformid", async (req, res) => {
  try {
    const userId = req.query.formId;
    const forms = await CreateForm.find({ _id: userId });
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.get("/getallforms", async (req, res) => {
  try {
    const forms = await CreateForm.find();
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Form Response
app.post("/submitform", async (req, res) => {
  try {
    const { formId, email, answers } = req.body;

    const form = new FormResponse({
      formId: formId,
      email: email,
      answer: answers,
    });

    await form.save();
    return res.status(201).json({ message: "Form Subbmitted", form });
  } catch (err) {
    console.error("Error in /Subbmitting Form:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/submitform", async (req, res) => {
  try {
    const formId = req.query.formId;
    const forms = await FormResponse.find({ formId: formId });
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch("/submitform", async (req, res) => {
  try {
    const { answer, responseId } = req.body;

    const updatedResponse = await FormResponse.findByIdAndUpdate(
      new mongoose.Types.ObjectId(responseId),
      { answer },
      { new: true }
    );

    if (!updatedResponse) {
      return res.status(404).json({ message: "Response not found" });
    }

    res
      .status(201)
      .json({ message: "Response updated", response: updatedResponse });
  } catch (err) {
    console.error("Error in PATCH /submitform:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.get("/submitformbyid", async (req, res) => {
  try {
    const responseId = req.query.responseId;
    const forms = await FormResponse.find({
      _id: new mongoose.Types.ObjectId(responseId),
    });
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});
app.get("/submitformbyemailandformid", async (req, res) => {
  try {
    const email = req.query.email;
    const formId = req.query.formId;
    const forms = await FormResponse.find({ email: email, formId: formId });
    return res.status(200).json({ forms });
  } catch (err) {
    console.error("Error in GET /createform:", err);
    return res.status(500).json({ error: err.message });
  }
});
