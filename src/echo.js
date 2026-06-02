import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: true,
    enabledTransports: ['ws', 'wss'],

    // ✅ Token based auth — CSRF ka koi chakkar nahi
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            const token = localStorage.getItem('token');
            fetch(`${import.meta.env.VITE_API_URL}/broadcasting/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    socket_id: socketId,
                    channel_name: channel.name,
                }),
            })
            .then(res => res.json())
            .then(data => callback(null, data))
            .catch(err => callback(err, null));
        }
    }),
});

window.Echo = echo;

export default echo;