import express from "express";
const app = express();

// Minimal healthcheck
app.get("/", (req, res) => res.send("Backend Running"));

// Hint Railway: force HTTP detection
app.get("/healthz", (req, res) => res.status(200).send("OK"));

// Listen on dynamic Railway port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
