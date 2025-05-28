import { inirouter } from './router.js';
import { Navbar } from './components/Navbar.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(Navbar());
    const content = document.createElement('div');
    content.id = 'content';
    app.appendChild(content);
    inirouter();

})