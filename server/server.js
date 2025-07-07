const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://yashgithub907:Y%40sh%403097@cluster0.w1mjtna.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Create or fetch user
app.post("/user", async (req, res) => {
  const { name, smk, password } = req.body;
  let user = smk
    ? await User.findOne({ smk })
    : await User.findOne({ password });

  if (!user) {
    user = await User.create({ name, smk, password, goal: 0, readCount: 0 });
  }

  res.json(user);
});

// Set goal
app.post("/set-goal", async (req, res) => {
  const { smk, password, goal } = req.body;
  const user = await User.findOne(smk ? { smk } : { password });
  if (user) {
    user.goal = goal;
    await user.save();
    res.json(user);
  } else res.status(404).json({ error: "User not found" });
});

// Update read count
app.post("/update-count", async (req, res) => {
  const { smk, password, count } = req.body;
  const user = await User.findOne(smk ? { smk } : { password });
  if (user) {
    user.readCount = count;
    await user.save();
    res.json(user);
  } else res.status(404).json({ error: "User not found" });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));
