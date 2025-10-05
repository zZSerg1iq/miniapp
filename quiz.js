// Логика для типа "Викторина"
let answerOptionsCount = 0;

function initQuiz() {
    // Создаем начальные 2 варианта ответа
    if (answerOptionsCount === 0) {
        createInitialOptions();
    }
    validateQuizForm();
}

function createInitialOptions() {
    const optionsContainer = document.getElementById('answer-options');
    optionsContainer.innerHTML = ''; // Очищаем контейнер
    
    // Создаем 2 начальных варианта
    for (let i = 0; i < 2; i++) {
        addAnswerOption(true);
    }
}

function validateQuizForm() {
    const question = document.getElementById('quiz-question').value.trim();
    const answers = document.querySelectorAll('.quiz-answer');
    
    let filledAnswers = 0;
    let hasCorrect = false;
    
    answers.forEach(answer => {
        if (answer.value.trim()) {
            filledAnswers++;
            const checkbox = answer.parentElement.querySelector('.correct-checkbox');
            if (checkbox.checked) {
                hasCorrect = true;
            }
        }
    });
    
    const sendBtn = document.getElementById('send-quiz-btn');
    // Кнопка активна если есть вопрос, минимум 2 заполненных ответа и хотя бы один верный
    sendBtn.disabled = !(question && filledAnswers >= 2 && hasCorrect);
}

function addAnswerOption(isInitial = false) {
    if (answerOptionsCount >= 10) return;
    
    answerOptionsCount++;
    const optionsContainer = document.getElementById('answer-options');
    const newOption = document.createElement('div');
    newOption.className = 'answer-option';
    newOption.innerHTML = `
        <input type="text" placeholder="Вариант ответа ${answerOptionsCount}" class="quiz-answer">
        <div class="correct-answer-container">
            <input type="checkbox" class="correct-checkbox" title="Верный ответ">
            <span class="correct-label">Верный ответ</span>
        </div>
        <button type="button" class="btn-remove-answer">🗑️</button>
    `;
    optionsContainer.appendChild(newOption);
    
    // Добавляем обработчики событий для новых полей
    newOption.querySelector('.quiz-answer').addEventListener('input', validateQuizForm);
    newOption.querySelector('.correct-checkbox').addEventListener('change', validateQuizForm);
    
    // Для начальных вариантов не добавляем кнопку удаления
    if (!isInitial) {
        newOption.querySelector('.btn-remove-answer').addEventListener('click', function() {
            if (answerOptionsCount > 2) {
                newOption.remove();
                answerOptionsCount--;
                validateQuizForm();
                
                // Включаем кнопку добавления если было достигнуто максимума
                if (answerOptionsCount < 10) {
                    document.getElementById('add-option-btn').disabled = false;
                }
            }
        });
    } else {
        // Для начальных вариантов скрываем кнопку удаления
        newOption.querySelector('.btn-remove-answer').style.display = 'none';
    }
    
    // Обновляем кнопку добавления, если достигнут максимум
    if (answerOptionsCount >= 10) {
        document.getElementById('add-option-btn').disabled = true;
    }
    
    validateQuizForm();
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

function sendQuizData() {
    const data = getQuizData();
    console.log('Отправка данных викторины:', data);
    sendData(data);
}

// Обработчики для формы "Викторина"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('quiz-question').addEventListener('input', validateQuizForm);
    document.getElementById('add-option-btn').addEventListener('click', () => addAnswerOption(false));
    
    document.getElementById('send-quiz-btn').addEventListener('click', sendQuizData);
});
