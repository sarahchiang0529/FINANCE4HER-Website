const API_BASE_URL = 'http://localhost:4000/api/learning-journal';

// Fetch all journal questions
export async function fetchJournalQuestions() {
  try {
    const response = await fetch(`${API_BASE_URL}/journal-questions`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.questions || [];
  } catch (error) {
    console.error('Error fetching journal questions:', error);
    throw error;
  }
}

// Fetch user's journal answers
export async function fetchJournalAnswers(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/journal-answers?userId=${encodeURIComponent(userId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.answers || [];
  } catch (error) {
    console.error('Error fetching journal answers:', error);
    throw error;
  }
}

// Save a new journal answer
export async function saveJournalAnswer(answerPayload) {
  try {
    const response = await fetch(`${API_BASE_URL}/journal-answers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(answerPayload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.answer;
  } catch (error) {
    console.error('Error saving journal answer:', error);
    throw error;
  }
}

// Update an existing journal answer
export async function updateJournalAnswer(answerId, answer, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/journal-answers/${answerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer, userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result.answer;
  } catch (error) {
    console.error('Error updating journal answer:', error);
    throw error;
  }
}

// Delete a journal answer
export async function deleteJournalAnswer(answerId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/journal-answers/${answerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting journal answer:', error);
    throw error;
  }
}