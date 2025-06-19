
document.addEventListener('DOMContentLoaded', () => {
    const socket = io({ autoConnect: false }); // Don't connect immediately

    const messages = document.getElementById('messages');
    const chatForm = document.getElementById('form');
    const chatInput = document.getElementById('input');
    const connectionButton = document.getElementById('connection-btn');
    const expensiveButton = document.getElementById('expensive-btn');

    const authContainer = document.getElementById('auth-container');
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const authMessage = document.getElementById('auth-message');

    let authToken = localStorage.getItem('authToken');
    if (authToken) {
        authContainer.style.display = 'none';
        socket.auth = { token: authToken };
        socket.connect();
    } else {
        authContainer.style.display = 'flex';
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = registerUsernameInput.value;
        const password = registerPasswordInput.value;
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        authMessage.innerText = data.message;
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        authMessage.innerText = data.message;
        if (data.token) {
            localStorage.setItem('authToken', data.token);
            authToken = data.token;
            authContainer.style.display = 'none';
            socket.auth = { token: authToken };
            socket.connect();
        }
    });

    socket.on('connect', () => {
        console.log('Connected to server with token:', authToken);
        socket.emit('load history');
        connectionButton.innerText = 'Disconnect';
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server.');
        connectionButton.innerText = 'Connect';
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (chatInput.value) {
            socket.emit('chat message', chatInput.value);
            chatInput.value = '';
        }
    });

    chatForm.addEventListener('submit', () => {})

    socket.on('chat message', (msg) => {
        const item = document.createElement('li');
        item.textContent = msg;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('history loaded', (history) => {
        messages.innerHTML = '';
        history.forEach(data => {
            const item = document.createElement('li');
            item.textContent = data.content;
            messages.appendChild(item);
        });
        window.scrollTo(0, document.body.scrollHeight);
    });

    connectionButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (socket.connected) {
            connectionButton.innerText = 'Connect';
            socket.disconnect();
        } else {
            connectionButton.innerText = 'Disconnect';
            socket.connect();
        }
    });

    expensiveButton.addEventListener('click', (e) => {
        e.preventDefault();

        const requestId = Date.now().toString();
        socket.emit('expensive', { requestId });

        expensiveButton.innerText = 'Running...';
        expensiveButton.disabled = true;

        socket.on('completed', ({ requestId: returnedId }) => {
            if (requestId === returnedId) {
                expensiveButton.innerText = 'Expensive';
                expensiveButton.disabled = false;
            }
        });
    });


});