import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./LearningResources.css";
import { ChevronDown, ChevronUp, Save, Edit, Trash2, AlertCircle } from "lucide-react";
import {
  fetchJournalQuestions,
  fetchJournalAnswers,
  saveJournalAnswer,
  updateJournalAnswer,
  deleteJournalAnswer
} from "../../utils/LearningJournalAPI";

const PersonalJournal = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  // State management
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [expandedItems, setExpandedItems] = useState({});
  const [editingAnswers, setEditingAnswers] = useState({});
  const [savingStates, setSavingStates] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const questionsData = await fetchJournalQuestions();
        setQuestions(questionsData);
      } catch (error) {
        console.error("Failed to load questions:", error);
        setErrors(prev => ({ ...prev, questions: "Failed to load questions" }));
      }
    };
    loadQuestions();
  }, []);

  // Load user's answers when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?.sub || questions.length === 0) {
      setIsLoadingData(false);
      return;
    }

    const loadAnswers = async () => {
      try {
        setIsLoadingData(true);
        const answersData = await fetchJournalAnswers(user.sub);

        // Convert answers array to object keyed by questionId
        const answersMap = {};
        answersData.forEach(answer => {
          answersMap[answer.questionId] = answer;
        });
        setAnswers(answersMap);
      } catch (error) {
        console.error("Failed to load answers:", error);
        setErrors(prev => ({ ...prev, answers: "Failed to load your answers" }));
      } finally {
        setIsLoadingData(false);
      }
    };

    loadAnswers();
  }, [isAuthenticated, user?.sub, questions]);

  const toggleExpanded = (questionId) => {
    setExpandedItems(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAnswerChange = (questionId, value) => {
    setEditingAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSaveAnswer = async (questionId) => {
    if (!isAuthenticated || !user?.sub) {
      alert("Please log in to save your answers");
      return;
    }

    const answerText = editingAnswers[questionId]?.trim();
    if (!answerText) {
      setErrors(prev => ({ ...prev, [questionId]: "Answer cannot be empty" }));
      return;
    }

    setSavingStates(prev => ({ ...prev, [questionId]: true }));
    setErrors(prev => ({ ...prev, [questionId]: null }));

    try {
      const existingAnswer = answers[questionId];

      if (existingAnswer) {
        const updatedAnswer = await updateJournalAnswer(existingAnswer.id, answerText, user.sub);
        setAnswers(prev => ({ ...prev, [questionId]: updatedAnswer }));
      } else {
        const newAnswer = await saveJournalAnswer({
          userId: user.sub,
          questionId,
          answer: answerText,
        });
        setAnswers(prev => ({ ...prev, [questionId]: newAnswer }));
      }

      // Clear editing state
      setEditingAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to save answer:", error);
      setErrors(prev => ({
        ...prev,
        [questionId]: error.message || "Failed to save answer",
      }));
    } finally {
      setSavingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleEditAnswer = (questionId) => {
    const existingAnswer = answers[questionId];
    setEditingAnswers(prev => ({
      ...prev,
      [questionId]: existingAnswer?.answer || "",
    }));
  };

  const handleDeleteAnswer = async (questionId) => {
    const existingAnswer = answers[questionId];
    if (!existingAnswer || !window.confirm("Are you sure you want to delete this answer?")) {
      return;
    }

    setSavingStates(prev => ({ ...prev, [questionId]: true }));

    try {
      await deleteJournalAnswer(existingAnswer.id, user.sub);

      setAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });

      setEditingAnswers(prev => {
        const updated = { ...prev };
        delete updated[questionId];
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete answer:", error);
      setErrors(prev => ({ ...prev, [questionId]: "Failed to delete answer" }));
    } finally {
      setSavingStates(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const cancelEdit = (questionId) => {
    setEditingAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
    setErrors(prev => ({ ...prev, [questionId]: null }));
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Personal Journal</h1>
          <p className="page-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Personal Journal</h1>
          <p className="page-subtitle">Please log in to access your personal journal</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1 className="page-title">Personal Journal</h1>
        <p className="page-subtitle">Reflect on your financial journey and goals</p>
      </div>

      {errors.questions && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {errors.questions}
        </div>
      )}

      {errors.answers && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {errors.answers}
        </div>
      )}

      <div className="journal-card">
        <div className="accordion-container">
          {questions.map((question) => {
            const questionId = question.id;
            const isExpanded = !!expandedItems[questionId];
            const existingAnswer = answers[questionId];
            const isEditing = Object.prototype.hasOwnProperty.call(editingAnswers, questionId);
            const isSaving = !!savingStates[questionId];
            const error = errors[questionId];

            const headerId = `journal-header-${questionId}`;
            const contentId = `journal-panel-${questionId}`;

            return (
              <div
                className={`accordion-item ${isExpanded ? "active" : ""}`}
                key={questionId}
              >
                <button
                  id={headerId}
                  className={`accordion-header ${isExpanded ? "active" : ""}`}
                  onClick={() => toggleExpanded(questionId)}
                  aria-expanded={isExpanded}
                  aria-controls={contentId}
                >
                  <span className="accordion-title">{question.question}</span>
                  <div className="accordion-header-actions">
                    {existingAnswer && <span className="answer-indicator">✓</span>}
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div
                    id={contentId}
                    role="region"
                    aria-labelledby={headerId}
                    className="accordion-content"
                  >
                    {error && (
                      <div className="error-message">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}

                    {/* Display existing answer when not editing */}
                    {existingAnswer && !isEditing && (
                      <div className="saved-answer">
                        <p className="answer-text">{existingAnswer.answer}</p>
                        <div className="answer-actions">
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => handleEditAnswer(questionId)}
                            disabled={isSaving}
                          >
                            <Edit size={16} className="btn-icon" />
                            Edit
                          </button>

                          <button
                            className="btn-danger btn-sm"
                            onClick={() => handleDeleteAnswer(questionId)}
                            disabled={isSaving}
                          >
                            <Trash2 size={16} className="btn-icon" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show textarea when editing or no answer exists */}
                    {(isEditing || !existingAnswer) && (
                      <div className="answer-editor">
                        <textarea
                          className="journal-input"
                          placeholder="Write your thoughts here..."
                          value={editingAnswers[questionId] || ""}
                          onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                          rows={4}
                          disabled={isSaving}
                        />
                        <div className="editor-actions">
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => handleSaveAnswer(questionId)}
                            disabled={isSaving || !editingAnswers[questionId]?.trim()}
                          >
                            <Save size={16} className="btn-icon" />
                            {isSaving ? "Saving..." : "Save Answer"}
                          </button>

                          {existingAnswer && (
                            <button
                              className="btn-cancel btn-sm"
                              onClick={() => cancelEdit(questionId)}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PersonalJournal;