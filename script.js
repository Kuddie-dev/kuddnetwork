// ===== SUPABASE CONFIG =====
const SUPABASE_URL = 'https://sblzozaxjqsabcioeonx.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNibHpvemF4anFzYWJjaW9lb254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNzA2MzYsImV4cCI6MjA5Njg0NjYzNn0.HQW7wf4mGvWC71wo4h1pBZ8go8SrX2b25psNKpUswNE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== PARTICLE SYSTEM =====
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
});

window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 136, ${this.opacity})`;
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000));
    for (let i = 0; i < count; i++) {
        particles.push(new Particle());
    }
}
initParticles();

function connectParticles() {
    const maxDist = 120;
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < maxDist) {
                const opacity = (1 - dist / maxDist) * 0.15;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        // Connect to mouse
        if (mouse.x !== null) {
            const dx = particles[i].x - mouse.x;
            const dy = particles[i].y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                const opacity = (1 - dist / 150) * 0.3;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animateParticles);
}
animateParticles();

// ===== CLOCK =====
function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('id-ID', { hour12: false });
    document.getElementById('clock').textContent = time;
}
setInterval(updateClock, 1000);
updateClock();

// ===== LOAD PUBLIC LINKS =====
async function loadLinks() {
    const grid = document.getElementById('linksGrid');
    try {
        const { data, error } = await supabase
            .from('public_links')
            .select('*')
            .eq('is_active', true)
            .order('display_order', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            // Fallback ke data hardcoded
            const fallback = [
                {
                    platform: 'github',
                    username: 'Kuddie-dev',
                    url: 'https://github.com/Kuddie-dev',
                    icon: '⚡'
                },
                {
                    platform: 'email',
                    username: 'KuddAsaharaOfficial@protonmail.com',
                    url: 'mailto:KuddAsaharaOfficial@protonmail.com',
                    icon: '✉'
                }
            ];
            renderLinks(fallback);
        } else {
            renderLinks(data);
        }
    } catch (err) {
        console.error('Error loading links:', err);
        // Fallback
        renderLinks([
            {
                platform: 'github',
                username: 'Kuddie-dev',
                url: 'https://github.com/Kuddie-dev',
                icon: '⚡'
            },
            {
                platform: 'email',
                username: 'KuddAsaharaOfficial@protonmail.com',
                url: 'mailto:KuddAsaharaOfficial@protonmail.com',
                icon: '✉'
            }
        ]);
    }
}

function renderLinks(links) {
    const grid = document.getElementById('linksGrid');
    grid.innerHTML = '';

    const platformIcons = {
        github: '⚡',
        email: '✉',
        twitter: '🐦',
        discord: '💬',
        telegram: '📡',
        linkedin: '💼',
        default: '◈'
    };

    links.forEach((link, index) => {
        const icon = platformIcons[link.platform?.toLowerCase()] || platformIcons.default;
        const card = document.createElement('a');
        card.href = link.url;
        card.target = link.platform?.toLowerCase() === 'email' ? '_self' : '_blank';
        card.className = 'link-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="link-icon">${icon}</div>
            <div class="link-info">
                <div class="link-platform">${link.platform}</div>
                <div class="link-username">${link.username}</div>
            </div>
            <div class="link-arrow">→</div>
        `;
        grid.appendChild(card);
    });
}

loadLinks();

// ===== KUDD ONLY MODAL =====
const kuddBtn = document.getElementById('kuddOnlyBtn');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const accessCodeInput = document.getElementById('accessCode');
const verifyBtn = document.getElementById('verifyBtn');
const authStatus = document.getElementById('authStatus');

kuddBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    setTimeout(() => accessCodeInput.focus(), 300);
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
});

function closeModal() {
    modalOverlay.classList.remove('active');
    accessCodeInput.value = '';
    authStatus.textContent = '';
    authStatus.className = 'auth-status';
}

accessCodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') verifyCode();
});

verifyBtn.addEventListener('click', verifyCode);

async function verifyCode() {
    const code = accessCodeInput.value.trim();
    if (!code) {
        showAuthStatus('Please enter access code.', 'error');
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.classList.add('loading');
    authStatus.textContent = '';

    try {
        const { data, error } = await supabase.rpc('verify_access_code', {
            input_code: code
        });

        if (error) throw error;

        if (data && data.length > 0 && data[0].valid) {
            showAuthStatus('Access granted. Redirecting...', 'success');
            // Simpan session
            sessionStorage.setItem('kudd_access', 'true');
            sessionStorage.setItem('kudd_session_id', generateSessionId());
            sessionStorage.setItem('kudd_label', data[0].label || 'Personal Access');

            setTimeout(() => {
                closeModal();
                openPrivatePanel();
            }, 800);
        } else {
            showAuthStatus('Invalid access code. Access denied.', 'error');
            accessCodeInput.value = '';
            accessCodeInput.focus();
        }
    } catch (err) {
        console.error('Verification error:', err);
        showAuthStatus('Connection error. Please try again.', 'error');
    } finally {
        verifyBtn.disabled = false;
        verifyBtn.classList.remove('loading');
    }
}

function showAuthStatus(message, type) {
    authStatus.textContent = message;
    authStatus.className = `auth-status ${type}`;
}

function generateSessionId() {
    return 'KUDD-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

// ===== PRIVATE PANEL =====
const privatePanel = document.getElementById('privatePanel');
const panelOverlay = document.getElementById('panelOverlay');
const panelClose = document.getElementById('panelClose');
const panelBody = document.getElementById('panelBody');
const logoutBtn = document.getElementById('logoutBtn');

function openPrivatePanel() {
    privatePanel.classList.add('active');
    document.getElementById('sessionId').textContent = sessionStorage.getItem('kudd_session_id') || '---';
    loadPrivateContent();
}

function closePrivatePanel() {
    privatePanel.classList.remove('active');
}

panelClose.addEventListener('click', closePrivatePanel);
panelOverlay.addEventListener('click', (e) => {
    if (e.target === panelOverlay) closePrivatePanel();
});

logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('kudd_access');
    sessionStorage.removeItem('kudd_session_id');
    sessionStorage.removeItem('kudd_label');
    closePrivatePanel();
});

async function loadPrivateContent() {
    panelBody.innerHTML = `
        <div class="panel-loading">
            <div class="spinner"></div>
            <p>Decrypting secure data...</p>
        </div>
    `;

    try {
        const { data, error } = await supabase.rpc('get_private_content');

        if (error) throw error;

        if (!data || data.length === 0) {
            panelBody.innerHTML = `
                <div class="panel-content">
                    <div class="content-section">
                        <div class="section-label">System</div>
                        <div class="section-title">Empty Sector</div>
                        <div class="section-body">No private content configured yet. Add content via Supabase SQL Editor.</div>
                    </div>
                </div>
            `;
            return;
        }

        const sections = data.reduce((acc, item) => {
            if (!acc[item.section]) acc[item.section] = [];
            acc[item.section].push(item);
            return acc;
        }, {});

        let html = '<div class="panel-content">';
        Object.keys(sections).forEach(section => {
            sections[section].forEach(item => {
                let bodyContent = item.content;
                if (item.content_type === 'json') {
                    try {
                        const parsed = JSON.parse(item.content);
                        bodyContent = JSON.stringify(parsed, null, 2);
                    } catch { /* keep as is */ }
                }

                html += `
                    <div class="content-section">
                        <div class="section-label">${section}</div>
                        <div class="section-title">${item.title}</div>
                        <div class="section-body">${bodyContent}</div>
                    </div>
                `;
            });
        });
        html += '</div>';
        panelBody.innerHTML = html;

    } catch (err) {
        console.error('Error loading private content:', err);
        panelBody.innerHTML = `
            <div class="panel-content">
                <div class="content-section">
                    <div class="section-label">Error</div>
                    <div class="section-title">Connection Failed</div>
                    <div class="section-body">Unable to load private content. Please check your connection.</div>
                </div>
            </div>
        `;
    }
}

// Cek session saat load
window.addEventListener('load', () => {
    if (sessionStorage.getItem('kudd_access') === 'true') {
        // User sudah login, bisa langsung buka panel
        // Tapi kita biarin mereka klik Kudd Only dulu
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (privatePanel.classList.contains('active')) {
            closePrivatePanel();
        } else if (modalOverlay.classList.contains('active')) {
            closeModal();
        }
    }
});
