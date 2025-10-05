// Логика для типа "Ответить на вопрос"
let correctAnswersCount = 1;

function initRiddle() {
    createInitialAnswers();
    validateRiddleForm();
}

function createInitialAnswers() {
    const answersContainer = document.getElementById('correct-answers');
    answersContainer.innerHTML = ''; // Очищаем контейнер
    
    // Создаем первый вариант ответа
    addCorrectAnswer(true);
}

function validateRiddleForm() {
    const riddleText = document.getElementById('riddle-text').value.trim();
    const answers = document.querySelectorAll('.correct-answer-input');
    let hasAnswers = false;
    
    answers.forEach(answer => {
        if (answer.value.trim()) {
            hasAnswers = true;
        }
    });
    
    const sendBtn = document.getElementById('send-riddle-btn');
    // Кнопка активна если есть вопрос и хотя бы один ответ
    sendBtn.disabled = !(riddleText && hasAnswers);
}

function addCorrectAnswer(isInitial = false) {
    correctAnswersCount++;
    const answersContainer = document.getElementById('correct-answers');
    const newAnswer = document.createElement('div');
    newAnswer.className = 'answer-option';
    newAnswer.innerHTML = `
        <input type="text" placeholder="Правильный ответ ${correctAnswersCount}" class="correct-answer-input">
        <button type="button" class="btn-remove-answer">🗑️</button>
    `;
    answersContainer.appendChild(newAnswer);
    
    // Добавляем обработчики событий для нового поля
    newAnswer.querySelector('.correct-answer-input').addEventListener('input', validateRiddleForm);
    
    // Для начального варианта скрываем кнопку удаления
    if (!isInitial) {
        newAnswer.querySelector('.btn-remove-answer').addEventListener('click', function() {
            if (correctAnswersCount > 2) {
                newAnswer.remove();
                correctAnswersCount--;
                validateRiddleForm();
            }
        });
    } else {
        newAnswer.querySelector('.btn-remove-answer').style.display = 'none';
    }
    
    validateRiddleForm();
}

function getRiddleData() {
    const question = document.getElementById('riddle-text').value.trim();
    const minAnswers = parseInt(document.getElementById('min-answers').value) || 1;
    const correctAnswers = [];
    
    document.querySelectorAll('.correct-answer-input').forEach(input => {
        const answer = input.value.trim();
        if (answer) {
            correctAnswers.push(answer);
        }
    });
    
    return {
        type: 'riddle',
        question: question,
        correctAnswers: correctAnswers,
        minCorrectAnswers: minAnswers,
        completionMessage: document.getElementById('riddle-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Общая логика для сообщений при завершении
function initCompletionMessages() {
    // Для сообщения
    document.getElementById('toggle-message-completion').addEventListener('click', function() {
        const content = document.getElementById('message-completion-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? 
            '+ Сообщение при завершении' : '- Скрыть сообщение при завершении';
    });
    
    // Для викторины
    document.getElementById('toggle-quiz-completion').addEventListener('click', function() {
        const content = document.getElementById('quiz-completion-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? 
            '+ Сообщение при завершении' : '- Скрыть сообщение при завершении';
    });
    
    // Для геоточки
    document.getElementById('toggle-geo-completion').addEventListener('click', function() {
        const content = document.getElementById('geo-completion-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? 
            '+ Сообщение при завершении' : '- Скрыть сообщение при завершении';
    });
    
    // Для ответа на вопрос
    document.getElementById('toggle-riddle-completion').addEventListener('click', function() {
        const content = document.getElementById('riddle-completion-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? 
            '+ Сообщение при завершении' : '- Скрыть сообщение при завершении';
    });
}

// Обработчики для формы "Ответить на вопрос"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('riddle-text').addEventListener('input', validateRiddleForm);
    document.getElementById('min-answers').addEventListener('input', validateRiddleForm);
    document.getElementById('add-correct-answer-btn').addEventListener('click', () => addCorrectAnswer(false));
    
    document.getElementById('send-riddle-btn').addEventListener('click', () => {
        const data = getRiddleData();
        sendData(data);
    });
});
