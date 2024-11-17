import React, { useState, useEffect, useRef } from 'react';
import FlashcardList from './FlashcardList';
import './app.css';
import axios from 'axios';

function App() {
  const [flashcards, setFlashcards] = useState([]);
  const [categories, setCategories] = useState([]);

  const categoryEl = useRef();
  const amountEl = useRef();

  // Fetch categories from API on mount
  useEffect(() => {
    axios
      .get('https://opentdb.com/api_category.php')
      .then(res => {
        setCategories(res.data.trivia_categories);
      });
  }, []);

  // Decode special HTML characters in strings
  function decodeString(str) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
  }

  // Generate flashcards from API
  function handleSubmit(e) {
    e.preventDefault();
    axios
      .get('https://opentdb.com/api.php', {
        params: {
          amount: amountEl.current.value,
          category: categoryEl.current.value,
        },
      })
      .then(res => {
        setFlashcards(
          res.data.results.map((questionItem, index) => {
            const answer = decodeString(questionItem.correct_answer);
            const options = [
              ...questionItem.incorrect_answers.map(a => decodeString(a)),
              answer,
            ];
            return {
              id: `${index}-${Date.now()}`,
              question: decodeString(questionItem.question),
              answer: answer,
              options: options.sort(() => Math.random() - 0.5), // Shuffle options
            };
          })
        );
      });
  }

  // Clear all flashcards
  function handleClear() {
    setFlashcards([]);
  }

  // Add custom flashcards
  function handleAddFlashcard(e) {
    e.preventDefault();
    const question = e.target.question.value.trim();
    const answer = e.target.answer.value.trim();

    // Ensure both fields are filled
    if (!question || !answer) {
      alert('Both Question and Answer fields are required.');
      return;
    }

    setFlashcards(prevFlashcards => [
      ...prevFlashcards,
      {
        id: `${prevFlashcards.length}-${Date.now()}`,
        question,
        answer,
        options: [], // Add an empty options array for consistency
      },
    ]);
    e.target.reset(); // Clear the form
  }

  return (
    <>
      <form className="header" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select id="category" ref={categoryEl}>
            {categories.map(category => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="amount">Number Of Questions</label>
          <input
            type="number"
            id="amount"
            min="1"
            step="1"
            defaultValue={10}
            ref={amountEl}
          />
        </div>
        <div className="form-group">
          <button className="btn" type="submit">
            Generate
          </button>
          <button
            className="btn clear-btn"
            type="button"
            onClick={handleClear}
            style={{ marginLeft: '1rem' }}
          >
            Clear
          </button>
        </div>
      </form>
      <div className="container">
        <FlashcardList flashcards={flashcards} />
      </div>
      <form className="add-flashcard-form" onSubmit={handleAddFlashcard}>
        <h3>Add Your Own Flashcard (Optional)</h3>
        <div className="form-group">
          <label htmlFor="question">Enter Flashcard Question</label>
          <input
            type="text"
            id="question"
            name="question"
            placeholder="Enter Flashcard Question"
          />
        </div>
        <div className="form-group">
          <label htmlFor="answer">Enter Answer</label>
          <input
            type="text"
            id="answer"
            name="answer"
            placeholder="Enter Answer"
          />
        </div>
        <button className="btn" type="submit">
          Add Flashcard
        </button>
      </form>
    </>
  );
}

export default App;
