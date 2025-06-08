document.addEventListener('DOMContentLoaded', () => {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');

    function addMessageToHistory(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(type === 'my' ? 'my-message' : 'other-message');
        messageDiv.textContent = message;
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to bottom
    }

    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message === '') {
            return; // Boş mesaj gönderme
        }

        addMessageToHistory(message, 'my'); // Kendi mesajımı history'ye ekle

        // GET isteği gönderme
        const apiUrl = `http://localhost:8080/persons/freeText/${encodeURIComponent(message)}`;
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            // Gelen mesajı history'ye ekle
            addMessageToHistory(data || "Mesaj alındı.", 'other'); // Örnek olarak bir 'reply' alanı bekliyoruz
        } catch (error) {
            console.error('Mesaj gönderilirken bir hata oluştu:', error);
            addMessageToHistory("Mesaj gönderilemedi veya bir hata oluştu.", 'other');
        }

        messageInput.value = ''; // Mesaj kutusunu temizle
    }

    // Gönder butonuna tıklanınca
    sendButton.addEventListener('click', sendMessage);

    // Enter tuşuna basınca
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Sayfa yüklendiğinde örnek mesajlar ekleyelim (isteğe bağlı)
    addMessageToHistory("Merhaba! Nasıl yardımcı olabilirim?", 'other');
    addMessageToHistory("Selam, bir test mesajı gönderiyorum.", 'my');

    // Ses Kaydı İşlemleri
    const recordButton = document.getElementById('record-button');
    const stopButton = document.getElementById('stop-button');
    let mediaRecorder;
    let audioChunks = [];

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                // Ses dosyasını gönderme işlemini burada yapabilirsiniz
                console.log('Ses kaydı tamamlandı:', audioUrl);
				
				const formData = new FormData();
				formData.append('audio', audioBlob, 'recording.wav');

				fetch('/persons/freeSpeech/', {
					method: 'POST',
					body: formData
				})
				.then(response => {
					if (response.ok) {
						console.log('Ses kaydı başarıyla gönderildi');
					} else {
						console.error('Ses kaydı gönderilirken bir hata oluştu:', response.status);
					}
				})
				.catch(error => {
					console.error('Ses kaydı gönderilirken bir hata oluştu:', error);
				});
				
                audioChunks = [];
            };

            recordButton.onclick = () => {
                mediaRecorder.start();
                recordButton.disabled = true;
                stopButton.disabled = false;
                console.log('Kayıt başladı');
            };

            stopButton.onclick = () => {
                mediaRecorder.stop();
                recordButton.disabled = false;
                stopButton.disabled = true;
                console.log('Kayıt durdu');
            };
        })
        .catch(err => {
            console.error('Ses kaydı için izin verilmedi veya bir hata oluştu:', err);
        });
});
