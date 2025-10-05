javascript

// Логика для типа "Викторина"
let answerOptionsCount = 0;

function initQuiz() {
    if (answerOptionsCount === 0) {
        addAnswerOption();
        addAnswerOption();
    }
    validateQuizForm();
}

function validateQuizForm() {
    const question = document.getElementById('quiz-question').value.trim();
    const answers = document.querySelectorAll('.quiz-answer');
    let hasAnswers = false;
    let hasCorrect = false;
    
    answers.forEach(answer => {
        if (answer.value.trim()) {
            hasAnswers = true;
            const checkbox = answer.parentElement.querySelector('.correct-checkbox');
            if (checkbox.checked) {
                hasCorrect = true;
            }
        }
    });
    
    const sendBtn = document.getElementById('send-quiz-btn');
    sendBtn.disabled = !(question && hasAnswers && hasCorrect);
}

function addAnswerOption() {
    if (answerOptionsCount >= 10) return;
    
    answerOptionsCount++;
    const optionsContainer = document.getElementById('answer-options');
    const newOption = document.createElement('div');
    newOption.className = 'answer-option';
    newOption.innerHTML = `
        <input type="text" placeholder="Вариант ответа ${answerOptionsCount}" class="quiz-answer">
        <input type="checkbox" class="correct-checkbox" title="Верный ответ">
        <button type="button" class="btn-remove-answer">🗑️</button>
    `;
    optionsContainer.appendChild(newOption);
    
    // Добавляем обработчики событий для новых полей
    newOption.querySelector('.quiz-answer').addEventListener('input', validateQuizForm);
    newOption.querySelector('.correct-checkbox').addEventListener('change', validateQuizForm);
    newOption.querySelector('.btn-remove-answer').addEventListener('click', function() {
        if (answerOptionsCount > 2) {
            newOption.remove();
            answerOptionsCount--;
            validateQuizForm();
        }
    });
    
    // Обновляем кнопку добавления, если достигнут максимум
    if (answerOptionsCount >= 10) {
        document.getElementById('add-option-btn').disabled = true;
    }
}

function getQuizData() {
    const question = document.getElementById('quiz-question').value.trim();
    const answers = [];
    
    document.querySelectorAll('.answer-option').forEach(option => {
        const answerText = option.querySelector('.quiz-answer').value.trim();
        const isCorrect = option.querySelector('.correct-checkbox').checked;
        
        if (answerText) {
            answers.push({
                text: answerText,
                correct: isCorrect
            });
        }
    });
    
    return {
        type: 'quiz',
        question: question,
        answers: answers,
        completionMessage: document.getElementById('quiz-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Обработчики для формы "Викторина"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('quiz-question').addEventListener('input', validateQuizForm);
    document.getElementById('add-option-btn').addEventListener('click', addAnswerOption);
    
    document.getElementById('send-quiz-btn').addEventListener('click', () => {
        const data = getQuizData();
        sendData(data);
    });
});
