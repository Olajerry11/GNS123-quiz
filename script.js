/**
 * JABU Quiz Application
 * A lightweight, zero-dependency client-side application.
 */

// The 'rawQuizData' variable is now loaded from data.js

class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        // DOM Elements
        this.els = {
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            errorDetails: document.getElementById('error-details'),
            quizState: document.getElementById('quiz-state'),
            resultsState: document.getElementById('results-state'),
            questionCounter: document.getElementById('question-counter'),
            scoreDisplay: document.getElementById('score-display'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            nextBtn: document.getElementById('next-btn'),
            finalScoreValue: document.getElementById('final-score-value'),
            totalQuestionsValue: document.getElementById('total-questions-value'),
            restartBtn: document.getElementById('restart-btn')
        };

        this.init();
    }

    init() {
        this.bindEvents();
        // Simulating data loading/fetching
        setTimeout(() => {
            this.parseData(rawQuizData);
        }, 300);
    }

    bindEvents() {
        this.els.nextBtn.addEventListener('click', () => this.handleNextQuestion());
        this.els.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    /**
     * Parses the raw markdown text into an array of question objects.
     * @param {string} markdown 
     */
    parseData(markdown) {
        try {
            this.questions = [];
            // Split the raw string by "---" which separates the questions
            const blocks = markdown.split(/---/).map(block => block.trim()).filter(Boolean);

            for (const block of blocks) {
                // Ignore blocks that don't contain an ANSWER section
                if (!/ANSWER:/i.test(block)) continue;

                // Match question text: number, dot, optional stars, then text until the first option "- A)"
                const questionMatch = block.match(/\**\s*\d+\.\s*\**\s*(.*?)\n\s*-\s+[A-Z]\)/s);
                if (!questionMatch) continue;

                const questionText = questionMatch[1].trim();

                // Extract Options
                const options = [];
                const optionRegex = /-\s*([A-Z])\)\s*([^\n]+)/gi;
                let optMatch;
                while ((optMatch = optionRegex.exec(block)) !== null) {
                    options.push({
                        letter: optMatch[1].toUpperCase(),
                        text: optMatch[2].trim()
                    });
                }

                // Extract Answer
                const answerMatch = block.match(/ANSWER:\s*([A-Z])/i);
                if (!answerMatch || options.length === 0) continue;

                this.questions.push({
                    question: questionText,
                    options: options,
                    answer: answerMatch[1].toUpperCase()
                });
            }

            if (this.questions.length === 0) {
                throw new Error("No valid questions could be parsed from the data. Please check the formatting.");
            }

            this.startQuiz();
        } catch (error) {
            console.error("Data Parsing Error:", error);
            this.showError(error.message);
        }
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.switchState(this.els.quizState);
        this.renderQuestion();
    }

    renderQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        
        // Update counters
        this.els.questionCounter.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        this.els.scoreDisplay.textContent = `Score: ${this.score}`;

        // Render text
        this.els.questionText.textContent = question.question;

        // Render options
        this.els.optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.dataset.letter = option.letter;
            btn.innerHTML = `<strong>${option.letter})</strong>&nbsp; ${option.text}`;
            btn.addEventListener('click', () => this.handleOptionSelection(btn, question.answer));
            this.els.optionsContainer.appendChild(btn);
        });

        // Hide next button initially
        this.els.nextBtn.classList.add('hidden');
    }

    handleOptionSelection(selectedBtn, correctAnswerLetter) {
        // Lock all buttons to prevent double-clicking
        const buttons = this.els.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => btn.disabled = true);

        const selectedLetter = selectedBtn.dataset.letter;
        const isCorrect = selectedLetter === correctAnswerLetter;

        if (isCorrect) {
            selectedBtn.classList.add('correct');
            this.score++;
            this.els.scoreDisplay.textContent = `Score: ${this.score}`;
        } else {
            selectedBtn.classList.add('incorrect');
            // Highlight the correct answer in green
            buttons.forEach(btn => {
                if (btn.dataset.letter === correctAnswerLetter) {
                    btn.classList.add('correct');
                }
            });
        }

        // Show Next button
        this.els.nextBtn.classList.remove('hidden');
    }

    handleNextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.renderQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        this.switchState(this.els.resultsState);
        this.els.finalScoreValue.textContent = this.score;
        this.els.totalQuestionsValue.textContent = this.questions.length;
    }

    restartQuiz() {
        this.startQuiz();
    }

    showError(message) {
        this.switchState(this.els.errorState);
        this.els.errorDetails.textContent = message;
    }

    switchState(activeStateEl) {
        // Hide all states
        [this.els.loadingState, this.els.errorState, this.els.quizState, this.els.resultsState].forEach(el => {
            el.classList.add('hidden');
        });
        // Show active state
        activeStateEl.classList.remove('hidden');
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});