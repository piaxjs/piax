import express from "express";

const app = express();
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello Express" });
});

app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "John" }]);
});

app.get("/api/users/:id", (req, res) => {
  res.json({ id: req.params.id, name: "John" });
});

app.post("/api/users", (req, res) => {
  res.json({ id: 123, ...req.body });
});

app.listen(3000, () => {
  console.log("Express server running on http://localhost:3000");
  process.send?.("READY");
});
