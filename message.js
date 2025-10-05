javascript

// Логика для типа "Сообщение"
function initMessage() {
    validateMessageForm();
}

function validateMessageForm() {
    const messageText = document.getElementById('message-text').value.trim();
    const sendBtn = document.getElementById('send-message-btn');
    sendBtn.disabled = !messageText;
}

function getMessageData() {
    const fileInput = document.getElementById('message-file');
    const file = fileInput.files[0];
    let fileData = null;
    
    if (file) {
        fileData = {
            name: file.name,
            type: file.type,
            size: file.size
        };
    }
    
    return {
        type: 'message',
        text: document.getElementById('message-text').value.trim(),
        file: fileData,
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
    });
    
    document.getElementById('send-message-btn').addEventListener('click', () => {
        const data = getMessageData();
        sendData(data);
    });
});
