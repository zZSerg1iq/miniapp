// Логика для типа "Викторина"
let answerOptionsCount = 0;

function initQuiz() {
    console.log('Инициализация викторины...');
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
            if (checkbox && checkbox.checked) {
                hasCorrect = true;
            }
        }
    });
    
    const sendBtn = document.getElementById('send-quiz-btn');
    // Кнопка активна если есть вопрос, минимум 2 заполненных ответа и хотя бы один верный
    const isValid = !!(question && filledAnswers >= 2 && hasCorrect);
    sendBtn.disabled = !isValid;
    console.log('Валидация викторины:', { question, filledAnswers, hasCorrect, isValid });
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
    const answerInput = newOption.querySelector('.quiz-answer');
    const checkbox = newOption.querySelector('.correct-checkbox');
    
    answerInput.addEventListener('input', validateQuizForm);
    checkbox.addEventListener('change', validateQuizForm);
    
    // Для начальных вариантов не добавляем кнопку удаления
    if (!isInitial) {
        const removeBtn = newOption.querySelector('.btn-remove-answer');
        removeBtn.addEventListener('click', function() {
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
        const answerInput = option.querySelector('.quiz-answer');
        const checkbox = option.querySelector('.correct-checkbox');
        
        if (answerInput && checkbox) {
            const answerText = answerInput.value.trim();
            const isCorrect = checkbox.checked;
            
            if (answerText) {
                answers.push({
                    text: answerText,
                    correct: isCorrect
                });
            }
        }
    });
    
    const data = {
        type: 'quiz',
        question: question,
        answers: answers,
        completionMessage: document.getElementById('quiz-completion-text')?.value.trim() || null,
        timestamp: new Date().toISOString()
    };
    
    console.log('Данные викторины для отправки:', data);
    return data;
}

function sendQuizData() {
    console.log('Нажата кнопка отправки викторины');
    try {
        const data = getQuizData();
        console.log('Отправка данных викторины:', data);
        
        // Проверяем, определена ли функция sendData
        if (typeof sendData === 'function') {
            sendData(data);
        } else {
            console.error('Функция sendData не определена');
            // Альтернативный способ отправки
            if (window.Telegram?.WebApp) {
                window.Telegram.WebApp.sendData(JSON.stringify(data));
            } else {
                console.log('Данные для отправки (вне Telegram):', data);
            }
        }
    } catch (error) {
        console.error('Ошибка при отправке викторины:', error);
    }
}

// Обработчики для формы "Викторина"
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка обработчиков викторины...');
    
    const questionInput = document.getElementById('quiz-question');
    const addOptionBtn = document.getElementById('add-option-btn');
    const sendQuizBtn = document.getElementById('send-quiz-btn');
    
    if (questionInput) {
        questionInput.addEventListener('input', validateQuizForm);
    } else {
        console.error('Элемент quiz-question не найден');
    }
    
    if (addOptionBtn) {
        addOptionBtn.addEventListener('click', () => addAnswerOption(false));
    } else {
        console.error('Элемент add-option-btn не найден');
    }
    
    if (sendQuizBtn) {
        sendQuizBtn.addEventListener('click', sendQuizData);
        console.log('Обработчик отправки викторины установлен');
    } else {
        console.error('Элемент send-quiz-btn не найден');
    }
});
