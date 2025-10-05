// api/telegram-upload.js
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fileData, fileName, fileType } = await parseRequest(request);
        
        // Загружаем файл в Telegram
        const telegramResult = await uploadToTelegram(fileData, fileName, fileType);
        
        response.status(200).json({
            success: true,
            fileInfo: telegramResult
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        response.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

async function parseRequest(req) {
    // Для Vercel нужно обработать multipart/form-data
    // Используем временное решение с base64
    const { fileBase64, fileName, fileType } = req.body;
    
    if (!fileBase64) {
        throw new Error('No file data provided');
    }
    
    // Конвертируем base64 в Buffer
    const base64Data = fileBase64.split(',')[1]; // удаляем data:image/... префикс
    const fileBuffer = Buffer.from(base64Data, 'base64');
    
    return {
        fileData: fileBuffer,
        fileName: fileName || 'file',
        fileType: fileType || 'application/octet-stream'
    };
}

async function uploadToTelegram(fileBuffer, fileName, fileType) {
    // Создаем FormData для Telegram API
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: fileType });
    
    formData.append('chat_id', CHAT_ID);
    formData.append('document', blob, fileName);
    
    const telegramResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData
    });
    
    const result = await telegramResponse.json();
    
    if (result.ok) {
        const document = result.result.document;
        return {
            fileId: document.file_id,
            fileUniqueId: document.file_unique_id,
            fileName: document.file_name,
            fileSize: document.file_size,
            mimeType: document.mime_type,
            messageId: result.result.message_id,
            chatId: result.result.chat.id,
            directLink: `https://api.telegram.org/file/bot${BOT_TOKEN}/${document.file_path}`,
            messageLink: `https://t.me/c/${String(result.result.chat.id).replace('-100', '')}/${result.result.message_id}`
        };
    } else {
        throw new Error(`Telegram API: ${result.description}`);
    }
}

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb'
        }
    }
};
