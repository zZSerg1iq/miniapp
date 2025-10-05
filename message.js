// Логика для типа "Сообщение"
function initMessage() {
    validateMessageForm();
}

function validateMessageForm() {
    const messageText = document.getElementById('message-text').value.trim();
    const fileInput = document.getElementById('message-file');
    const hasFile = fileInput.files.length > 0;
    
    const sendBtn = document.getElementById('send-message-btn');
    sendBtn.disabled = !(messageText || hasFile);
}

// Функция для загрузки файла
async function uploadFile(file) {
    // Здесь должен быть ваш сервер для загрузки файлов
    // Для демонстрации создаем временную ссылку
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            // В реальном приложении здесь должен быть fetch на ваш сервер
            const fileData = {
                url: URL.createObjectURL(file), // временная ссылка
                name: file.name,
                type: file.type,
                size: file.size,
                base64: e.target.result // для небольших файлов можно использовать base64
            };
            resolve(fileData);
        };
        reader.readAsDataURL(file);
    });
}

async function getMessageData() {
    const fileInput = document.getElementById('message-file');
    const file = fileInput.files[0];
    let fileData = null;
    
    if (file) {
        try {
            showStatus('📤 Загрузка файла...', 'loading');
            fileData = await uploadFile(file);
            showStatus('✅ Файл загружен', 'success');
        } catch (error) {
            console.error('Ошибка загрузки файла:', error);
            showStatus('❌ Ошибка загрузки файла', 'error');
            return null;
        }
    }
    
    return {
        type: 'message',
        text: document.getElementById('message-text').value.trim(),
        file: fileData, // теперь здесь полные данные файла
        completionMessage: document.getElementById('message-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Обработчики для формы "Сообщение"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('message-text').addEventListener('input', validateMessageForm);
    
    document.getElementById('message-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const fileInfo = document.getElementById('message-file-info');
        
        if (file) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            if (fileSizeMB > 10) {
                fileInfo.innerHTML = '<span style="color: red;">❌ Файл слишком большой (макс. 10 МБ)</span>';
                e.target.value = '';
            } else {
                fileInfo.innerHTML = `✅ Файл: ${file.name} (${fileSizeMB} МБ)`;
            }
        } else {
            fileInfo.innerHTML = '';
        }
        validateMessageForm();
    });
    
    document.getElementById('send-message-btn').addEventListener('click', async () => {
        const sendBtn = document.getElementById('send-message-btn');
        sendBtn.disabled = true;
        sendBtn.textContent = '📤 Отправка...';
        
        const data = await getMessageData();
        if (data) {
            sendData(data);
        }
        
        sendBtn.disabled = false;
        sendBtn.textContent = '📤 Отправить';
    });
});
