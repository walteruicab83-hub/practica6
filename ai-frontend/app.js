let conversationHistory = [];

async function sendMessage() {
  const inputField = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatBox = document.getElementById('chatBox');
  const text = inputField.value.trim();
  if (!text) return;

  // 1. Mostrar mensaje del usuario
  appendMessage(text, 'user');
  inputField.value = '';
  conversationHistory.push({ role: 'user', content: text });

  // Activar efecto de carga y bloquear el botón
  sendBtn.disabled = true;
  showTyping();

  try {
    // 2. Enviar petición al backend
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        history: conversationHistory.slice(0, -1)
      })
    });

    const data = await response.json();
    hideTyping();

    if (data.reply) {
      // 3. Mostrar respuesta del agente
      appendMessage(data.reply, 'assistant');
      conversationHistory.push({ role: 'assistant', content: data.reply });
    } else {
      appendMessage('Error: No se pudo obtener respuesta del servidor.', 'assistant');
    }
  } catch (error) {
    console.error('Error de red:', error);
    hideTyping();
    appendMessage('Error de conexión con el servidor.', 'assistant');
  }

  sendBtn.disabled = false;
  inputField.focus();
  chatBox.scrollTop = chatBox.scrollHeight;
}

function appendMessage(text, sender) {
  const chatBox = document.getElementById('chatBox');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Mostrar los tres puntos animados
function showTyping() {
  const chatBox = document.getElementById('chatBox');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typingIndicator';
  typingDiv.className = 'message assistant typing';
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Quitar los tres puntos
function hideTyping() {
  const typingDiv = document.getElementById('typingIndicator');
  if (typingDiv) typingDiv.remove();
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !document.getElementById('sendBtn').disabled) {
    sendMessage();
  }
}