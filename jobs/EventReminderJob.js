// server/jobs/eventReminder.job.js
import cron from "node-cron";
import Event from "../models/Event.js";
import Notification from "../models/Notification.js";

cron.schedule("*/30 * * * *", async () => {
  const upcoming = await Event.find({
    date: { $gte: new Date(), $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  for (const event of upcoming) {
    await Notification.create({
      user: event.createdBy,
      message: `Reminder: Your event "${event.title}" is happening soon ⏰`,
      type: "reminder",
    });
  }

  console.log("⏳ Event reminders sent");
});
