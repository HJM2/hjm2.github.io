// Base URL for the JSONPlaceholder API
const API_BASE = "https://my-json-server.typicode.com/hjm2/hjm2.github.io/";

// Application state variables
let quizzesData = [];          // will hold list of quizzes
let currentQuizId = null;
let questionsData = [];        // will hold questions of the current quiz
let currentQuestionIndex = 0;
let scoreCount = 0;
let totalQuestions = 0;
let userName = "";
let startTime = null;
let timerInterval = null;
const correctMessages = ["Good job!", "Well done!", "Nice work!", "Correct!", "Great job!"];

// Compile Handlebars templates (once at start)
const templates = {
  welcome: Handlebars.compile(document.getElementById('welcome-template').innerHTML),
  questionMultiple: Handlebars.compile(document.getElementById('question-multiple-template').innerHTML),
  questionText: Handlebars.compile(document.getElementById('question-text-template').innerHTML),
  questionImage: Handlebars.compile(document.getElementById('question-image-template').innerHTML),
  feedbackIncorrect: Handlebars.compile(document.getElementById('feedback-incorrect-template').innerHTML),
  feedbackCorrect: Handlebars.compile(document.getElementById('feedback-correct-template').innerHTML),
  result: Handlebars.compile(document.getElementById('result-template').innerHTML)
};

//Update the timer display each second
function updateTimerDisplay() {
  const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
  const mm = Math.floor(elapsedSec / 60);
  const ss = elapsedSec % 60;
  // Format mm:ss
  const timeStr = mm + ":" + ss.toString().padStart(2, '0');
  document.getElementById('status-time').textContent = timeStr;
}


function showWelcomeScreen() {
  // Hide status bar (not needed on welcome screen)
  document.getElementById('status-bar').classList.add('d-none');
  // Render welcome template with available quizzes and any pre-filled name
  const welcomeHTML = templates.welcome({ quizzes: quizzesData, name: userName });
  document.getElementById('app').innerHTML = welcomeHTML;
  // Attach event handlers for quiz selection buttons
  const nameInput = document.getElementById('playerNameInput');
  document.querySelectorAll('.start-quiz-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedQuizId = btn.getAttribute('data-quiz-id');
      const enteredName = nameInput.value.trim();
      if (!enteredName) {
        alert("Please enter your name to start the quiz.");  // simple validation
        return;
      }
      userName = enteredName;
      startQuiz(selectedQuizId);
    });
  });
}

// Start the quiz: initialize state, fetch questions, show first question
async function startQuiz(quizId) {
  currentQuizId = quizId;
  scoreCount = 0;
  currentQuestionIndex = 0;
  // Show and reset status bar for new quiz
  const statusBar = document.getElementById('status-bar');
  statusBar.classList.remove('d-none');
  document.getElementById('status-name').textContent = userName;
  document.getElementById('status-score').textContent = scoreCount;
  document.getElementById('status-progress').textContent = `0/0`;  // will update after fetching questions
  document.getElementById('status-time').textContent = '0:00';
  // Start timer
  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimerDisplay, 1000);
  // Fetch questions for the selected quiz
  try {
    const res = await fetch(`${API_BASE}/questions?quizId=${quizId}`);
    questionsData = await res.json();
  } catch (err) {
    console.error("Failed to load questions", err);
    alert("Error: Could not load quiz questions. Please try again.");
    return;
  }
  totalQuestions = questionsData.length;
  // Update total questions in progress display
  document.getElementById('status-progress').textContent = `0/${totalQuestions}`;
  // Render the first question
  showQuestion();
}

// Render the current question view based on question type
function showQuestion() {
  const questionObj = questionsData[currentQuestionIndex];
  let questionHTML = "";
  // Choose the appropriate template for the question type
  if (questionObj.type === "multiple") {
    questionHTML = templates.questionMultiple(questionObj);
  } else if (questionObj.type === "text") {
    questionHTML = templates.questionText(questionObj);
  } else if (questionObj.type === "image") {
    questionHTML = templates.questionImage(questionObj);
  }
  document.getElementById('app').innerHTML = questionHTML;
  // Attach event listeners for answering the question:
  if (questionObj.type === "multiple") {
    // For multiple-choice, each option button
    document.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const choiceIndex = Number(btn.getAttribute('data-index'));
        checkAnswer(choiceIndex);
      });
    });
  } else if (questionObj.type === "text") {
    // For text input, submit button and Enter key
    document.getElementById('submit-text-btn').addEventListener('click', () => {
      const answerText = document.getElementById('textAnswerInput').value;
      checkAnswer(answerText);
    });
    // Allow pressing Enter key to submit the text answer
    document.getElementById('textAnswerInput').addEventListener('keyup', (e) => {
      if (e.key === "Enter") {
        const answerText = e.target.value;
        checkAnswer(answerText);
      }
    });
  } else if (questionObj.type === "image") {
    // For image choice, each image
    document.querySelectorAll('.img-choice').forEach(img => {
      img.addEventListener('click', () => {
        const choiceIndex = Number(img.getAttribute('data-index'));
        checkAnswer(choiceIndex);
      });
    });
  }
}

// Check the user's answer and provide feedback
function checkAnswer(userAnswer) {
  const questionObj = questionsData[currentQuestionIndex];
  let isCorrect = false;
  // Determine correctness based on question type
  if (questionObj.type === "text") {
    // Compare text answer (case-insensitive)
    if (typeof userAnswer === 'string') {
      isCorrect = userAnswer.trim().toLowerCase() === questionObj.answer.toLowerCase();
    }
  } else {
    // For multiple or image, compare selected choice index
    const chosenIndex = (typeof userAnswer === 'number') ? userAnswer : Number(userAnswer);
    isCorrect = (chosenIndex === questionObj.correctIndex);
  }
  // Show appropriate feedback
  if (isCorrect) {
    scoreCount++;
    // Update score in status bar
    document.getElementById('status-score').textContent = scoreCount;
    // Show a random correct message
    const msg = correctMessages[Math.floor(Math.random() * correctMessages.length)];
    const feedbackHTML = templates.feedbackCorrect({ message: msg });
    document.getElementById('app').innerHTML = feedbackHTML;
    // Automatically proceed to next question after 1 second
    setTimeout(() => {
      nextQuestion();
    }, 1000);
  } else {
    // Show explanation for incorrect answer
    const feedbackHTML = templates.feedbackIncorrect({ explanation: questionObj.explanation });
    document.getElementById('app').innerHTML = feedbackHTML;
    // Wait for user to acknowledge and move on
    document.getElementById('next-btn').addEventListener('click', () => {
      nextQuestion();
    });
  }
}

// Advance to the next question or finish the quiz
function nextQuestion() {
  // 1. Increment the question index
  currentQuestionIndex++;

  // 2. **Always** update the scoreboard here
  document.getElementById('status-progress').textContent = `${currentQuestionIndex}/${totalQuestions}`;

  // 3. If more questions remain, show next question; else show results
  if (currentQuestionIndex < totalQuestions) {
    showQuestion();
  } else {
    showResultScreen();
  }
}


// Display the final result screen
function showResultScreen() {
  // Stop the timer
  clearInterval(timerInterval);
  // Calculate score percentage
  const percentage = (scoreCount / totalQuestions) * 100;
  const passed = percentage >= 80;  // passing threshold > 80%
  const resultMsg = passed 
    ? `Congratulations ${userName}, you passed!` 
    : `Sorry ${userName}, you failed.`;
  // Total time taken in seconds
  const totalTimeSec = Math.floor((Date.now() - startTime) / 1000);
  // Render result template
  const resultHTML = templates.result({
    resultMessage: resultMsg,
    score: scoreCount,
    total: totalQuestions,
    time: totalTimeSec
  });
  document.getElementById('app').innerHTML = resultHTML;
  // Hide status bar (optional to help user focus on result message)
  document.getElementById('status-bar').classList.add('d-none');
  // Attach buttons for retake or home
  document.getElementById('retake-btn').addEventListener('click', () => {
    // Restart the same quiz
    startQuiz(currentQuizId);
  });
  document.getElementById('home-btn').addEventListener('click', () => {
    // Go back to main welcome screen
    showWelcomeScreen();
  });
}

// Initial load: fetch quizzes list and show welcome screen
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE}/quizzes`);
    quizzesData = await res.json();
  } catch (err) {
    console.error("Failed to load quizzes", err);
    alert("Error: Could not load quiz list. Please refresh or try again later.");
  }
  showWelcomeScreen();
});
