let tg = null;
let selectedType = null;

function initializeApp() {
    tg = window.Telegram?.WebApp;
    
    if (tg) {
        try {
            tg.expand();
            tg.enableClosingConfirmation();
            
            // Получаем данные пользователя
            const user = tg.initDataUnsafe?.user;
            const userId = user?.id || 'Не доступно';
            const userName = user ? 
                `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim() : 
                'Аноним';
            
            // Обновляем интерфейс
            document.getElementById('user-id').textContent = userId;
            document.getElementById('user-name').textContent = userName;
            document.getElementById('platform-info').textContent = 
                `${tg.platform} • ${tg.colorScheme} тема`;
            
            console.log('Telegram WebApp инициализирован');
            return tg;
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram WebApp:', error);
            return null;
        }
    } else {
        document.getElementById('platform-info').textContent = 'Браузер (вне Telegram)';
        return null;
    }
}

function showStatus(text, type) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = text;
    statusEl.className = `status ${type}`;
    statusEl.style.display = 'block';
}

function hideAllStageContent() {
    document.querySelectorAll('.stage-content').forEach(el => {
        el.style.display = 'none';
    });
}

function updateActiveButtons() {
    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    });
    
    if (selectedType) {
        const activeBtn = document.querySelector(`[data-type="${selectedType}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('btn-secondary');
            activeBtn.classList.add('btn-primary');
        }
    }
}

function showStageContent(type) {
    hideAllStageContent();
    const contentEl = document.getElementById(`${type}-content`);
    if (contentEl) {
        contentEl.style.display = 'block';
        
        // Инициализируем специфичные для типа функции
        if (type === 'geo') {
            setTimeout(() => initMap(), 100); // Небольшая задержка для инициализации карты
        } else if (type === 'quiz') {
            initQuiz();
        } else if (type === 'message') {
            initMessage();
        } else if (type === 'riddle') {
            initRiddle();
        }
    }
}

function sendData(data) {
    if (tg) {
        try {
            showStatus('Отправка...', 'loading');
            tg.sendData(JSON.stringify(data));
            showStatus('✅ Данные отправлены!', 'success');
            console.log('Данные успешно отправлены:', data);
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showStatus('❌ Ошибка при отправке', 'error');
        }
    } else {
        showStatus('⚠️ Данные готовы к отправке (вне Telegram)', 'success');
        console.log('Данные для отправки (вне Telegram):', data);
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    
    // Обработчики кнопок выбора типа этапа
    document.querySelectorAll('[data-type]').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedType = btn.dataset.type;
            updateActiveButtons();
            showStageContent(selectedType);
        });
    });
    
    // Инициализация сообщений при завершении
    initCompletionMessages();
});
