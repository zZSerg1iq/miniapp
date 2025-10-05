// Конфигурация
const CONFIG = {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    MAX_BASE64_SIZE: 1 * 1024 * 1024, // 1MB для base64
    BOT_USERNAME: '@BrainBuster_bot' // Замените на username вашего бота
};

// 🚀 Основная инициализация
let tg = null;
let selectedType = null;

function initializeApp() {
    tg = window.Telegram?.WebApp;
    
    if (tg && tg.initDataUnsafe) {
        try {
            tg.expand();
            tg.enableClosingConfirmation();
            
            console.log('Telegram WebApp данные:', tg.initDataUnsafe);
            
            // Получаем данные пользователя
            const user = tg.initDataUnsafe.user;
            const userId = user?.id ? user.id.toString() : 'Не доступно';
            const userName = user ? 
                `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim() : 
                'Аноним';
            
            // Обновляем интерфейс
            document.getElementById('user-id').textContent = userId;
            document.getElementById('user-name').textContent = userName || 'Аноним';
            document.getElementById('platform-info').textContent = 
                `${tg.platform} • ${tg.colorScheme} тема`;
            
            console.log('Telegram WebApp инициализирован:', { userId, userName });
            return tg;
            
        } catch (error) {
            console.error('Ошибка инициализации Telegram WebApp:', error);
            showFallbackInfo();
            return null;
        }
    } else {
        console.warn('Telegram WebApp не обнаружен или данные не переданы');
        showFallbackInfo();
        return null;
    }
}

function showFallbackInfo() {
    document.getElementById('user-id').textContent = 'Не доступно';
    document.getElementById('user-name').textContent = 'Аноним';
    document.getElementById('platform-info').textContent = 'Браузер (вне Telegram)';
    
    // Показываем предупреждение
    const warningBanner = document.querySelector('.warning-banner');
    if (warningBanner) {
        warningBanner.style.display = 'block';
        warningBanner.innerHTML = '⚠️ Для полной функциональности откройте приложение через Telegram бота.';
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
            setTimeout(() => initMap(), 100);
        } else if (type === 'quiz') {
            initQuiz();
        } else if (type === 'message') {
            initMessage();
        } else if (type === 'riddle') {
            initRiddle();
        }
    }
}

// Глобальная функция для отправки данных
window.sendData = function(data) {
    // Добавляем данные пользователя
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        data.userId = user.id;
        data.userName = `${user.first_name || ''}${user.last_name ? ' ' + user.last_name : ''}`.trim();
    }
    
    // Добавляем информацию о платформе
    data.platform = tg ? tg.platform : 'browser';
    data.language = tg ? tg.language : navigator.language;
    
    // Обработка файловых данных для предотвращения переполнения
    if (data.file && data.file.data && data.file.data.length > 50000) {
        // Для очень больших base64 данных оставляем только метаданные
        data.file.data = null;
        data.file.message = 'Data omitted due to size';
    }
    
    if (tg) {
        try {
            showStatus('Отправка данных в Telegram...', 'loading');
            
            // Отправляем через Telegram WebApp
            tg.sendData(JSON.stringify(data));
            
            showStatus('✅ Данные отправлены! Закрываю приложение...', 'success');
            
            console.log('Данные успешно отправлены:', {
                ...data,
                file: data.file ? {
                    name: data.file.name,
                    size: data.file.size,
                    type: data.file.type,
                    encoding: data.file.encoding
                } : null
            });
            
            // Закрываем приложение через 2 секунды
            setTimeout(() => {
                tg.close();
            }, 2000);
            
        } catch (error) {
            console.error('Ошибка отправки:', error);
            showStatus('❌ Ошибка при отправке', 'error');
        }
    } else {
        // Режим вне Telegram
        showStatus('⚠️ Данные готовы к отправке (вне Telegram)', 'success');
        console.log('Данные для отправки (вне Telegram):', data);
        
        // Показываем данные в alert для демонстрации
        alert('Данные для отправки:\n' + JSON.stringify({
            ...data,
            file: data.file ? `[File: ${data.file.name}]` : null
        }, null, 2));
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('Загрузка приложения...');
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
    if (typeof initCompletionMessages === 'function') {
        initCompletionMessages();
    }
});
