// server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ||8080;

// Create upload folders if they don't exist
const uploadDirs = ["uploads/thumbnails", "uploads/pdfs"];
uploadDirs.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

app.use(cors());
app.use(express.json());

// --- Multer setup ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.includes("image")) cb(null, "uploads/thumbnails");
    else cb(null, "uploads/pdfs");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  },
});
const upload = multer({ storage });

// --- Serve uploads ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- MySQL connection ---
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "lms",
});

db.connect((err) => {
  if (err) console.error("MySQL connection failed:", err);
  else console.log("MySQL connected successfully");
});

// --- ROUTES ---

// SIGNUP
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  db.query("SELECT * FROM users WHERE email=?", [email], (err, users) => {
    if (err) return res.status(500).json(err);
    if (users.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
      (err2) => {
        if (err2) return res.status(500).json(err2);
        res.json({ message: "Signup successful!" });
      }
    );
  });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, users) => {
      if (err) return res.status(500).json(err);
      if (!users[0]) return res.status(401).json({ message: "Wrong email or password" });

      const user = users[0];
      res.json({ role: user.role, name: user.name });
    }
  );
});

// Get all courses
app.get("/courses", (req, res) => {
  db.query("SELECT * FROM courses ORDER BY id DESC", (err, courses) => {
    if (err) return res.status(500).json(err);

    const courseIds = courses.map((c) => c.id);
    if (courseIds.length === 0) return res.json([]);

    db.query(
      "SELECT * FROM course_files WHERE course_id IN (?)",
      [courseIds],
      (err2, files) => {
        if (err2) return res.status(500).json(err2);

        courses.forEach((course) => {
          course.files = files.filter((f) => f.course_id === course.id);
        });

        res.json(courses);
      }
    );
  });
});

// Add new course
app.post(
  "/courses",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  (req, res) => {
    const { title, description } = req.body;
    const thumbnail = req.files?.["thumbnail"]?.[0]?.filename || null;
    const pdfFiles = req.files?.["pdfs"]?.map((f) => [0, f.filename]) || [];

    db.query(
      "INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?)",
      [title, description, thumbnail],
      (err, result) => {
        if (err) return res.status(500).json(err);
        const courseId = result.insertId;

        if (pdfFiles.length > 0) {
          const filesWithId = pdfFiles.map(([_, filename]) => [courseId, filename]);
          db.query(
            "INSERT INTO course_files (course_id, pdf_file) VALUES ?",
            [filesWithId],
            (err2) => {
              if (err2) return res.status(500).json(err2);
              res.json({ message: "Course added successfully" });
            }
          );
        } else {
          res.json({ message: "Course added successfully" });
        }
      }
    );
  }
);

// Update course
app.put(
  "/courses/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "pdfs", maxCount: 10 },
  ]),
  (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    const thumbnail = req.files?.["thumbnail"]?.[0]?.filename;
    const pdfFiles = req.files?.["pdfs"]?.map((f) => [id, f.filename]) || [];

    let sql, values;
    if (thumbnail) {
      sql = "UPDATE courses SET title=?, description=?, thumbnail=? WHERE id=?";
      values = [title, description, thumbnail, id];
    } else {
      sql = "UPDATE courses SET title=?, description=? WHERE id=?";
      values = [title, description, id];
    }

    db.query(sql, values, (err) => {
      if (err) return res.status(500).json(err);

      if (pdfFiles.length > 0) {
        db.query("INSERT INTO course_files (course_id, pdf_file) VALUES ?", [pdfFiles], (err2) => {
          if (err2) return res.status(500).json(err2);
          res.json({ message: "Course updated successfully" });
        });
      } else {
        res.json({ message: "Course updated successfully" });
      }
    });
  }
);

// Delete course
app.delete("/courses/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM course_files WHERE course_id=?", [id], (err) => {
    if (err) return res.status(500).json(err);

    db.query("DELETE FROM courses WHERE id=?", [id], (err2) => {
      if (err2) return res.status(500).json(err2);
      res.json({ message: "Course deleted successfully" });
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
