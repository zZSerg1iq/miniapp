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

async function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('https://yourdomain.com/upload.php', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            return {
                url: result.url,
                name: result.name,
                type: result.type,
                size: result.size
            };
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Upload error:', error);
        
        // Fallback: использовать base64 для небольших файлов
        if (file.size < 5 * 1024 * 1024) { // 5MB limit for base64
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve({
                    url: null,
                    base64: reader.result,
                    name: file.name,
                    type: file.type,
                    size: file.size
                });
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } else {
            throw new Error('File too large for fallback upload');
        }
    }
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
