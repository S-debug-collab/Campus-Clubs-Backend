import express from "express";
import dotenv from "dotenv";
import cors from "cors"
import connectDB from "./config/db.js";
import testRoutes from "./routes/TestRoute.js"
import authRoute from "./routes/AuthRoute.js"
import adminRoutes from "./routes/AdminRoute.js";
import clubRoutes from "./routes/ClubRoute.js"
import eventRoutes from "./routes/EventRoute.js"
import notificationRoutes from "./routes/NotificationRoute.js";
import "./jobs/EventReminderJob.js";
import suggestionRoutes from "./routes/SuggestionRoute.js";


import path from "path";

dotenv.config();

const app=express();

connectDB();

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Backend Running");
});
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/suggestions", suggestionRoutes);




const PORT = process.env.PORT || 5000; // fallback to 10000 for local dev

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
