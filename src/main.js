import { createApp } from 'vue';
import App from './App.vue';
import './firebase'; // Import Firebase configuration
import router from './router/index';
import './style.css';

const app = createApp(App)
app.use(router)
app.mount('#app')
