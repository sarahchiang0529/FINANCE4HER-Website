const express = require("express");
const router = express.Router();

// Utility function to convert snake_case to camelCase
const toCamelCase = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      val,
    ])
  );

// GET /api/journal-questions - Fetch all journal questions
router.get("/journal-questions", async (req, res) => {
  try {
    const { data, error } = await req.supabase
      .from("journal_questions")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch journal questions" });
    }

    const questions = data.map(toCamelCase);
    res.json({ questions });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/journal-answers - Fetch user's answers
router.get("/journal-answers", async (req, res) => {
  const { userId } = req.query;
  
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const { data, error } = await req.supabase
      .from("journal_answers")
      .select(`
        *,
        journal_questions (
          id,
          question
        )
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch journal answers" });
    }

    const answers = data.map(item => ({
      ...toCamelCase(item),
      question: item.journal_questions?.question || ""
    }));

    res.json({ answers });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/journal-answers - Create new answer
router.post("/journal-answers", async (req, res) => {
  const { userId, questionId, answer } = req.body;

  if (!userId || !questionId || !answer) {
    return res.status(400).json({ error: "Missing required fields: userId, questionId, answer" });
  }

  try {
    // First check if answer already exists
    const { data: existingAnswer } = await req.supabase
      .from("journal_answers")
      .select("id")
      .eq("user_id", userId)
      .eq("question_id", questionId)
      .single();

    if (existingAnswer) {
      return res.status(409).json({ error: "Answer already exists. Use PUT to update." });
    }

    // Create new answer
    const { data, error } = await req.supabase
      .from("journal_answers")
      .insert([
        {
          user_id: userId,
          question_id: questionId,
          answer: answer.trim()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Insert error:", error);
      return res.status(500).json({ error: "Failed to save answer" });
    }

    const camelCaseAnswer = toCamelCase(data);
    res.status(201).json({ answer: camelCaseAnswer });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/journal-answers/:id - Update existing answer
router.put("/journal-answers/:id", async (req, res) => {
  const answerId = req.params.id;
  const { answer, userId } = req.body;

  if (!answer || !userId) {
    return res.status(400).json({ error: "Missing required fields: answer, userId" });
  }

  try {
    const { data, error } = await req.supabase
      .from("journal_answers")
      .update({ answer: answer.trim() })
      .eq("id", answerId)
      .eq("user_id", userId) // Security: ensure user can only update their own answers
      .select()
      .single();

    if (error) {
      console.error("Update error:", error);
      return res.status(500).json({ error: "Failed to update answer" });
    }

    if (!data) {
      return res.status(404).json({ error: "Answer not found or you don't have permission to update it" });
    }

    const camelCaseAnswer = toCamelCase(data);
    res.json({ answer: camelCaseAnswer });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/journal-answers/:id - Delete answer
router.delete("/journal-answers/:id", async (req, res) => {
  const answerId = req.params.id;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    const { data, error } = await req.supabase
      .from("journal_answers")
      .delete()
      .eq("id", answerId)
      .eq("user_id", userId) // Security: ensure user can only delete their own answers
      .select()
      .single();

    if (error) {
      console.error("Delete error:", error);
      return res.status(500).json({ error: "Failed to delete answer" });
    }

    if (!data) {
      return res.status(404).json({ error: "Answer not found or you don't have permission to delete it" });
    }

    res.json({ message: "Answer deleted successfully" });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;