import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import axios from 'axios';

window.Pusher = Pusher;

// Axios ko cookies ke saath requests bhejne do
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

const echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],

    authEndpoint: 'http://10.134.38.199:php artisan serve --host=0.0.0.0 --port=80008000/broadcasting/auth',

    // ✅ Axios authorizer — cookies + CSRF automatically handle hoga
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            axios.post('http://10.134.38.199:8000/broadcasting/auth', {
                socket_id: socketId,
                channel_name: channel.name,
            })
            .then(res => callback(null, res.data))
            .catch(err => callback(err, null));
        }
    }),
});

window.Echo = echo; // ✅ Yeh add karo

export default echo;