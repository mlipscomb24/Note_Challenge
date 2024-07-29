const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public")); // Serves all static files from the public directory

// Serve the landing page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Serve the notes page
app.get("/notes", (req, res) => {
  res.sendFile(path.join(__dirname, "public/notes.html"));
});

// get notes
app.get("/api/notes", async (req, res, next) => {
  try {
    const data = await fs.readFile("db/db.json", "utf8");
    res.json(JSON.parse(data));
  } catch (err) {
    console.error("Error reading notes:", err);
    next(err); // Pass the error to the error handling middleware
  }
});

//  save a note
app.post("/api/notes", async (req, res, next) => {
  try {
    const data = await fs.readFile("db/db.json", "utf8");
    const notes = JSON.parse(data);
    const newNote = req.body;
    newNote.id = notes.length ? notes[notes.length - 1].id + 1 : 1; // Assign an ID
    notes.push(newNote);
    await fs.writeFile("db/db.json", JSON.stringify(notes, null, 2));
    res.json(newNote);
  } catch (err) {
    console.error("Error saving note:", err);
    next(err); // Pass the error to the error handling middleware
  }
});

//  delete a note
app.delete("/api/notes/:id", async (req, res, next) => {
  try {
    const data = await fs.readFile("db/db.json", "utf8");
    let notes = JSON.parse(data);
    const noteId = parseInt(req.params.id, 10);
    notes = notes.filter((note) => note.id !== noteId);
    await fs.writeFile("db/db.json", JSON.stringify(notes, null, 2));
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting note:", err);
    next(err); // Pass the error to the error handling middleware
  }
});

// Wildcard route to serve the landing page for any unmatched routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`App listening on PORT ${PORT}`);
});
