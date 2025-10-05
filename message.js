// Логика для типа "Сообщение"
function initMessage() {
    validateMessageForm();
    initFileUploadHandler();
}

function validateMessageForm() {
    const messageText = document.getElementById('message-text').value.trim();
    const fileInput = document.getElementById('message-file');
    const hasFile = fileInput.files.length > 0;
    
    const sendBtn = document.getElementById('send-message-btn');
    sendBtn.disabled = !(messageText || hasFile);
}

// Инициализация обработчика загрузки файлов
function initFileUploadHandler() {
    const fileInput = document.getElementById('message-file');
    const fileInfo = document.getElementById('message-file-info');
    
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        
        if (file) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
            
            // Проверка размера
            if (file.size > 10 * 1024 * 1024) {
                fileInfo.innerHTML = '<span style="color: red;">❌ Файл слишком большой (макс. 10 МБ)</span>';
                e.target.value = '';
                validateMessageForm();
                return;
            }
            
            fileInfo.innerHTML = `⏳ Загружаем файл: ${file.name} (${fileSizeMB} МБ)...`;
            
            try {
                // Автоматически загружаем файл в Telegram
                const uploadResult = await uploadFileToServer(file);
                
                if (uploadResult.success) {
                    fileInfo.innerHTML = `
                        ✅ Файл загружен в Telegram!
                        <br><small>ID: ${uploadResult.fileInfo.fileId}</small>
                        <br><small><a href="${uploadResult.fileInfo.messageLink}" target="_blank">Открыть в Telegram</a></small>
                    `;
                    
                    // Сохраняем информацию о файле в data-атрибут
                    fileInput.setAttribute('data-telegram-file-info', JSON.stringify(uploadResult.fileInfo));
                    
                } else {
                    throw new Error(uploadResult.error);
                }
            } catch (error) {
                console.error('Upload error:', error);
                fileInfo.innerHTML = `<span style="color: red;">❌ Ошибка загрузки: ${error.message}</span>`;
                e.target.value = '';
            }
        } else {
            fileInfo.innerHTML = '';
            fileInput.removeAttribute('data-telegram-file-info');
        }
        
        validateMessageForm();
    });
}

// Функция загрузки файла на сервер
async function uploadFileToServer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            try {
                showStatus('📤 Загрузка файла в Telegram...', 'loading');
                
                const response = await fetch('/api/telegram-upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        fileBase64: e.target.result,
                        fileName: file.name,
                        fileType: file.type
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showStatus('✅ Файл загружен в Telegram!', 'success');
                    resolve(result);
                } else {
                    throw new Error(result.error);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('Ошибка чтения файла'));
        reader.readAsDataURL(file);
    });
}

// Основная функция получения данных сообщения
async function getMessageData() {
    const fileInput = document.getElementById('message-file');
    const file = fileInput.files[0];
    let fileData = null;
    
    // Получаем информацию о загруженном файле из data-атрибута
    const telegramFileInfo = fileInput.getAttribute('data-telegram-file-info');
    if (telegramFileInfo) {
        fileData = JSON.parse(telegramFileInfo);
    }
    
    return {
        type: 'message',
        text: document.getElementById('message-text').value.trim(),
        file: fileData, // Теперь здесь полная информация из Telegram
        completionMessage: document.getElementById('message-completion-text').value.trim() || null,
        timestamp: new Date().toISOString()
    };
}

// Обработчики для формы "Сообщение"
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('message-text').addEventListener('input', validateMessageForm);
    
    document.getElementById('send-message-btn').addEventListener('click', async () => {
        const sendBtn = document.getElementById('send-message-btn');
        const originalText = sendBtn.textContent;
        
        sendBtn.disabled = true;
        sendBtn.textContent = '📤 Отправка...';
        
        try {
            const data = await getMessageData();
            if (data) {
                sendData(data);
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('❌ Ошибка при отправке', 'error');
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
