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

// Основная функция получения данных сообщения
async function getMessageData() {
    const fileInput = document.getElementById('message-file');
    const file = fileInput.files[0];
    let fileData = null;
    
    if (file) {
        try {
            // Проверяем размер файла
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                throw new Error(`Файл слишком большой. Максимум: ${CONFIG.MAX_FILE_SIZE / 1024 / 1024} МБ`);
            }
            
            showStatus('📤 Подготовка файла...', 'loading');
            
            // Для маленьких файлов используем base64, для больших - просим ссылку
            if (file.size <= CONFIG.MAX_BASE64_SIZE) {
                fileData = await uploadFileAsBase64(file);
                showStatus('✅ Файл подготовлен (base64)', 'success');
            } else {
                fileData = await getFileLinkFromUser(file);
                if (!fileData) {
                    throw new Error('Не получена ссылка на файл');
                }
            }
        } catch (error) {
            console.error('Ошибка обработки файла:', error);
            showStatus(`❌ ${error.message}`, 'error');
            return null;
        }
    }
    
    return {
        type: 'message',
        text: document.getElementById('message-text').value.trim(),
        file: fileData,
        completionMessage: document.getElementById('message-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Функция для base64 кодирования (для маленьких файлов)
async function uploadFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result, // base64 данные
                encoding: 'base64',
                uploadedAt: new Date().toISOString()
            });
        };
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

// Функция для получения ссылки от пользователя (для больших файлов)
async function getFileLinkFromUser(file) {
    return new Promise((resolve) => {
        const fileInfo = `Файл: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} МБ)`;
        
        showStatus(`
📎 ${fileInfo}

Файл слишком большой для прямой отправки. 

Варианты решения:
1. Загрузите файл в облако (Google Drive, Dropbox, Yandex Disk)
2. Получите публичную ссылку на файл
3. Вставьте ссылку ниже
        `, 'warning');

        setTimeout(() => {
            const fileUrl = prompt(`${fileInfo}\n\nВведите ссылку на файл:`);
            
            if (fileUrl && fileUrl.startsWith('http')) {
                resolve({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: fileUrl,
                    encoding: 'external_url',
                    uploadedAt: new Date().toISOString()
                });
            } else if (fileUrl) {
                showStatus('❌ Неверная ссылка. Используйте http:// или https://', 'error');
                resolve(null);
            } else {
                showStatus('❌ Отменено пользователем', 'error');
                resolve(null);
            }
        }, 1000);
    });
}

// Обработчики для формы "Сообщение"
document.addEventListener('DOMContentLoaded', function() {
    // Валидация формы
    document.getElementById('message-text').addEventListener('input', validateMessageForm);
    
    // Обработка выбора файла
    document.getElementById('message-file').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const fileInfo = document.getElementById('message-file-info');
        
        if (file) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            if (file.size > CONFIG.MAX_FILE_SIZE) {
                fileInfo.innerHTML = `<span style="color: red;">❌ Файл слишком большой (макс. ${CONFIG.MAX_FILE_SIZE / 1024 / 1024} МБ)</span>`;
                e.target.value = '';
            } else {
                fileInfo.innerHTML = `✅ Файл: ${file.name} (${fileSizeMB} МБ)`;
                
                // Предупреждение для больших файлов
                if (file.size > CONFIG.MAX_BASE64_SIZE) {
                    fileInfo.innerHTML += `<br><small style="color: orange;">⚠️ Потребуется ссылка на файл</small>`;
                }
            }
        } else {
            fileInfo.innerHTML = '';
        }
        validateMessageForm();
    });
    
    // Кнопка отправки
    document.getElementById('send-message-btn').addEventListener('click', async () => {
        const sendBtn = document.getElementById('send-message-btn');
        const originalText = sendBtn.textContent;
        
        sendBtn.disabled = true;
        sendBtn.textContent = '📤 Подготовка...';
        
        try {
            const data = await getMessageData();
            if (data) {
                sendData(data);
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('❌ Ошибка при подготовке данных', 'error');
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
        }
    });
    
    // Инициализация сообщений при завершении
    document.getElementById('toggle-message-completion').addEventListener('click', function() {
        const content = document.getElementById('message-completion-content');
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
        this.textContent = content.style.display === 'none' ? 
            '+ Сообщение при завершении' : '- Скрыть сообщение';
    });
});
