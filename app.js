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
    
    // Логируем что отправляем
    console.log('📤 Отправляемые данные:', {
        ...data,
        file: data.file ? `[Telegram File: ${data.file.fileName}]` : null
    });
    
    if (tg) {
        try {
            showStatus('Отправка данных в Telegram...', 'loading');
            tg.sendData(JSON.stringify(data));
            showStatus('✅ Данные отправлены! Закрываю приложение...', 'success');
            
            setTimeout(() => {
                tg.close();
            }, 2000);
            
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
