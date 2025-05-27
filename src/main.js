import { inject } from '@vercel/analytics';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index';
import './services/firebase';
import './style.css';
inject()

const app = createApp(App)
app.use(router)
app.mount('#app')
