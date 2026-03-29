import Suggestion from "../models/Suggestion.js";

export const toggleVote = async (req, res) => {
  try {
    const suggestion = await Suggestion.findById(req.params.id);

    const userId = req.user._id.toString();

    const index = suggestion.votes.findIndex(
      (id) => id.toString() === userId
    );

    if (index !== -1) {
      // ❌ already voted → remove
      suggestion.votes.splice(index, 1);
    } else {
      // ✅ not voted → add
      suggestion.votes.push(userId);
    }

    await suggestion.save();

    res.json({
      votes: suggestion.votes.length,
      voted: index === -1
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// CREATE suggestion
export const createSuggestion = async (req, res) => {
  try {
    const { topic, description } = req.body;

    // 🔥 CHECK DUPLICATE (same user + same content)
    const existing = await Suggestion.findOne({
      user: req.user._id,
      topic: topic.trim(),
      description: description.trim(),
    });

    if (existing) {
      return res.status(400).json({
        message: "You already submitted this suggestion 🚫",
      });
    }

    const suggestion = await Suggestion.create({
      user: req.user._id,
      topic: topic.trim(),
      description: description.trim(),
    });

    res.status(201).json(suggestion);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all suggestions (admin)
export const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
