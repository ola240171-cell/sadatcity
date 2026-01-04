// import { store } from './store.js'; // Removed for file:// compatibility

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.container = document.getElementById('app-view');
        this.init();
    }

    async checkAuth() {
        const { data: { session } } = await window.supabaseClient.auth.getSession();
        if (!session) {
            window.location.href = 'login.html';
        } else {
            console.log('User:', session.user.email);
            // Optional: Update profile name in sidebar
            document.querySelector('.user-profile .name').textContent = session.user.email.split('@')[0];
        }
    }

    async logout() {
        await window.supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    }

    init() {
        // Auth Check
        this.checkAuth();

        // Set Date
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'gregory' };
        document.getElementById('current-date').textContent = new Date().toLocaleDateString('ar-EG', dateOptions);

        // Sidebar Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Update specific active class target to be safe
                document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                const target = e.currentTarget;
                target.classList.add('active');

                const view = target.dataset.view;
                this.navigate(view);

                // Close sidebar on mobile if open
                if (window.innerWidth <= 768) {
                    this.toggleSidebar();
                }
            });
        });

        // Initial Load
        this.renderDashboard();
    }

    navigate(viewName) {
        this.currentView = viewName;
        this.container.innerHTML = ''; // Clear current view

        const headerTitle = document.getElementById('page-header');

        switch (viewName) {
            case 'dashboard':
                headerTitle.textContent = 'لوحة التحكم';
                this.renderDashboard();
                break;
            case 'properties':
                headerTitle.textContent = 'إدارة العقارات';
                this.renderProperties();
                break;
            case 'clients':
                headerTitle.textContent = 'قاعدة العملاء';
                this.renderClients();
                break;
            case 'ai-tools':
                headerTitle.textContent = 'الذكاء العقاري (AI)';
                this.renderAITools();
                break;
        }
    }

    toggleTheme() {
        const body = document.body;
        if (body.classList.contains('theme-dark')) {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light');
            document.querySelector('.fa-moon').classList.replace('fa-moon', 'fa-sun');
        } else {
            body.classList.remove('theme-light');
            body.classList.add('theme-dark');
            document.querySelector('.fa-sun').classList.replace('fa-sun', 'fa-moon');
        }
    }

    toggleMusic() {
        const audio = document.getElementById('bg-music');
        const btn = document.getElementById('music-btn');
        const icon = btn.querySelector('i');

        if (audio.paused) {
            audio.play();
            btn.style.color = 'var(--primary-color)';
            btn.style.borderColor = 'var(--primary-color)';
            icon.classList.remove('fa-music');
            icon.classList.add('fa-pause');
        } else {
            audio.pause();
            btn.style.color = '';
            btn.style.borderColor = '';
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-music');
        }
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.sidebar-overlay').classList.toggle('active');
    }

    // --- RENDERERS ---

    renderDashboard() {
        const stats = store.getStats();

        const html = `
            <div class="grid-3 animate-fade-in">
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <p style="color:var(--text-muted); font-size:0.9rem;">إجمالي العقارات</p>
                            <h3 style="font-size:2.5rem; font-weight:700;">${stats.totalProperties}</h3>
                        </div>
                        <div style="width:50px; height:50px; background:rgba(234, 179, 8, 0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--primary-color);">
                            <i class="fa-solid fa-building fa-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <p style="color:var(--text-muted); font-size:0.9rem;">العروض المتاحة</p>
                            <h3 style="font-size:2.5rem; font-weight:700; color:var(--success);">${stats.available}</h3>
                        </div>
                        <div style="width:50px; height:50px; background:rgba(16, 185, 129, 0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; color:var(--success);">
                            <i class="fa-solid fa-check-circle fa-xl"></i>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <p style="color:var(--text-muted); font-size:0.9rem;">قيمة المحفظة (تقريبي)</p>
                            <h3 style="font-size:2rem; font-weight:700;">${(stats.totalValue / 1000000).toFixed(1)}M <span style="font-size:1rem">ج.م</span></h3>
                        </div>
                        <div style="width:50px; height:50px; background:rgba(59, 130, 246, 0.1); border-radius:12px; display:flex; align-items:center; justify-content:center; color:#3b82f6;">
                            <i class="fa-solid fa-wallet fa-xl"></i>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity / Placeholder -->
            <div style="margin-top:2rem;" class="animate-fade-in">
                <h3 style="margin-bottom:1rem;">أحدث العقارات المضافة</h3>
                ${this.generatePropertiesTable(store.getProperties().slice(0, 3))}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderProperties() {
        const props = window.store.getProperties();

        const html = `
            <div class="toolbar animate-fade-in" style="margin-bottom:1.5rem; display:flex; gap:1rem; align-items:center;">
                <button class="btn btn-primary" onclick="window.app.renderAddPropertyForm()">
                    <i class="fa-solid fa-plus"></i> إضافة عقار جديد
                </button>
                <div style="position:relative; flex:1;">
                    <i class="fa-solid fa-search" style="position:absolute; right:15px; top:12px; color:var(--text-muted);"></i>
                    <input type="text" placeholder="بحث عن عقار..." onkeyup="window.app.filterProperties(this.value)" style="width:100%; padding:0.7rem 2.5rem 0.7rem 1rem; background:var(--bg-card); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                </div>
            </div>
            
            <div id="properties-list-container" class="animate-fade-in">
                ${this.generatePropertiesTable(props)}
            </div>
        `;

        this.container.innerHTML = html;
    }

    renderAddPropertyForm() {
        this.container.innerHTML = `
            <div class="animate-fade-in" style="max-width:800px; margin:0 auto;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:2rem;">
                    <button onclick="window.app.navigate('properties')" style="padding:0.5rem; background:var(--glass-bg); border-radius:50%; width:40px; height:40px; color:white;"><i class="fa-solid fa-arrow-right"></i></button>
                    <h2>إضافة عقار جديد</h2>
                </div>

                <form onsubmit="window.app.handlePropertySubmit(event)" class="card">
                    <div class="grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">عنوان العقار</label>
                            <input type="text" name="title" required placeholder="مثال: شقة للبيع بالمنطقة الأولى" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                        </div>
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">السعر (ج.م)</label>
                            <input type="number" name="price" required placeholder="0" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                        </div>
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">المساحة (م²)</label>
                            <input type="number" name="area" required placeholder="0" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                        </div>
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">المنطقة</label>
                            <select name="location" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                                <option value="المنطقة الأولى">المنطقة الأولى</option>
                                <option value="المنطقة الثالثة">المنطقة الثالثة</option>
                                <option value="المنطقة الخامسة">المنطقة الخامسة</option>
                                <option value="المنطقة السابعة">المنطقة السابعة</option>
                                <option value="حي الزيتون">حي الزيتون</option>
                                <option value="دار مصر">دار مصر</option>
                            </select>
                        </div>
                         <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">نوع العرض</label>
                            <div style="display:flex; gap:1rem;">
                                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                                    <input type="radio" name="type" value="sale" checked> بيع
                                </label>
                                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                                    <input type="radio" name="type" value="rent"> إيجار
                                </label>
                            </div>
                        </div>
                         <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">الحالة</label>
                            <select name="status" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                                <option value="available">متاح</option>
                                <option value="sold">تم البيع / التأجير</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;">
                        <i class="fa-solid fa-save"></i> حفظ العقار
                    </button>
                </form>
            </div>
        `;
    }

    handlePropertySubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProp = {
            title: formData.get('title'),
            price: Number(formData.get('price')),
            area: Number(formData.get('area')),
            location: formData.get('location'),
            type: formData.get('type'),
            status: formData.get('status'),
            dateAdded: new Date().toISOString().split('T')[0]
        };

        window.store.addProperty(newProp);
        alert('تم حفظ العقار بنجاح!');
        this.navigate('properties');
    }

    filterProperties(query) {
        const term = query.toLowerCase();
        const all = window.store.getProperties();
        const filtered = all.filter(p => p.title.toLowerCase().includes(term) || p.location.includes(term));
        document.getElementById('properties-list-container').innerHTML = this.generatePropertiesTable(filtered);
    }

    renderClients() {
        const clients = window.store.getClients();
        let html = `
            <div class="toolbar animate-fade-in" style="margin-bottom:1.5rem; display:flex; gap:1rem; align-items:center;">
                 <button class="btn btn-primary" onclick="window.app.renderAddClientForm()"><i class="fa-solid fa-user-plus"></i> تسجيل عميل جديد</button>
            </div>
            <div class="grid-3 animate-fade-in">
         `;

        clients.forEach(c => {
            const heatColor = c.status === 'hot' ? 'var(--danger)' : 'var(--warning)';
            const heatText = c.status === 'hot' ? 'مهتم جداً' : 'متوسط الاهتمام';

            html += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; margin-bottom:1rem;">
                        <div class="avatar" style="background:var(--bg-dark);">${c.name.substring(0, 2)}</div>
                        <span style="font-size:0.8rem; padding:0.2rem 0.8rem; border-radius:10px; background:${heatColor}; color:white;">${heatText}</span>
                    </div>
                    <h4>${c.name}</h4>
                    <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:0.5rem;"><i class="fa-solid fa-phone"></i> ${c.phone}</p>
                    
                    <div style="margin-top:1rem; padding-top:1rem; border-top:1px solid var(--glass-border); font-size:0.9rem;">
                        <p>مهتم بـ: <span class="text-gold">${c.interest === 'villa' ? 'فيلا' : 'شقة'}</span></p>
                        <p>الميزانية: ${(c.budget || 0).toLocaleString()} ج.م</p>
                    </div>
                </div>
             `;
        });

        this.container.innerHTML = html + '</div>';
    }

    renderAddClientForm() {
        this.container.innerHTML = `
            <div class="animate-fade-in" style="max-width:600px; margin:0 auto;">
                <div style="display:flex; align-items:center; gap:1rem; margin-bottom:2rem;">
                    <button onclick="window.app.navigate('clients')" style="padding:0.5rem; background:var(--glass-bg); border-radius:50%; width:40px; height:40px; color:white;"><i class="fa-solid fa-arrow-right"></i></button>
                    <h2>تسجيل عميل جديد</h2>
                </div>

                <form onsubmit="window.app.handleClientSubmit(event)" class="card">
                    <div style="display:grid; gap:1.5rem; margin-bottom:1.5rem;">
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">اسم العميل</label>
                            <input type="text" name="name" required placeholder="الاسم ثلاثي" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                        </div>
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">رقم الهاتف</label>
                            <input type="text" name="phone" required placeholder="01xxxxxxxxx" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                        </div>
                        <div class="grid-2" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
                            <div>
                                <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">الميزانية المتوقعة</label>
                                <input type="number" name="budget" required placeholder="0" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                            </div>
                            <div>
                                <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">نوع الاهتمام</label>
                                <select name="interest" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                                    <option value="apartment">شقة</option>
                                    <option value="villa">فيلا</option>
                                    <option value="land">أرض</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style="display:block; color:var(--text-muted); margin-bottom:0.5rem;">درجة الاهتمام</label>
                            <select name="status" style="width:100%; padding:0.8rem; background:rgba(0,0,0,0.2); border:1px solid var(--glass-border); border-radius:8px; color:white;">
                                <option value="hot">مهتم جداً (Hot)</option>
                                <option value="warm">متوسط (Warm)</option>
                                <option value="cold">بارد (Cold)</option>
                            </select>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width:100%; padding:1rem; font-size:1.1rem;">
                        <i class="fa-solid fa-save"></i> حفظ العميل
                    </button>
                </form>
            </div>
        `;
    }

    handleClientSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        window.store.addClient({
            name: formData.get('name'),
            phone: formData.get('phone'),
            budget: Number(formData.get('budget')),
            interest: formData.get('interest'),
            status: formData.get('status')
        });

        alert('تم تسجيل العميل بنجاح!');
        this.navigate('clients');
    }

    renderAITools() {
        this.container.innerHTML = `
            <div class="card animate-fade-in" style="max-width: 600px; margin: 0 auto; text-align:center; padding:3rem 2rem;">
                <div style="margin-bottom:1.5rem; width:80px; height:80px; background:linear-gradient(135deg, #a855f7, #ec4899); border-radius:50%; margin-inline:auto; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(168, 85, 247, 0.4);">
                    <i class="fa-solid fa-robot fa-2xl" style="color:white;"></i>
                </div>
                <h2>المساعد العقاري الذكي</h2>
                <p style="color:var(--text-muted); margin:1rem 0 2rem;">اكتب مميزات العقار وسأقوم بصياغة إعلان تسويقي احترافي لمنصات التواصل الاجتماعي.</p>
                
                <textarea id="ai-input" placeholder="مثال: شقة 3 غرف، تشطيب سوبر لوكس، بحري، تطل على حديقة..." style="width:100%; height:120px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:12px; color:white; padding:1rem; resize:none; margin-bottom:1rem;"></textarea>
                
                <div id="ai-result" style="display:none; margin-bottom:1.5rem; text-align:right; background:rgba(168, 85, 247, 0.1); padding:1rem; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3);"></div>

                <div id="ai-actions">
                    <button class="btn btn-primary" onclick="window.app.generateAIDescription()" style="width:100%; justify-content:center;">
                        <i class="fa-solid fa-magic"></i> توليد الوصف
                    </button>
                    <button class="btn" onclick="window.app.copyAIContent()" id="copy-btn" style="width:100%; justify-content:center; display:none; margin-top:0.5rem; border:1px solid var(--glass-border);">
                         <i class="fa-regular fa-copy"></i> نسخ النص
                    </button>
                </div>
            </div>
        `;
    }

    generateAIDescription() {
        const input = document.getElementById('ai-input').value;
        if (input.length < 5) return alert('الرجاء إدخال تفاصيل أكثر');

        const btn = document.querySelector('#ai-actions .btn-primary');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري التفكير...';
        btn.disabled = true;

        // Simulated AI Delay
        setTimeout(() => {
            const templates = [
                ` فرصة ذهبية بمدينة السادات! ✨\n\n${input}\n\nمميزات لا تفوت:\n✅ مساحة ممتازة وتقسيم ذكي\n✅ موقع استراتيجي في قلب الخدمات\n✅ أفضل استثمار لمستقبلك\n\n📞 للتواصـل والمعاينـة: 010xxxxxxx`,
                `🔥 لقطة الموسم بالسادات 🔥\n\nمواصفات العقار: ${input}\n\nليه تشتري العقار ده؟\n💎 تشطيب راقي جداً\n💎 فيو مفتوح ومتميز\n💎 تسهيلات في الدفع\n\n📌 بادر بالحجز الآن قبل فوات الأوان!\nللإتصال: 010xxxxxxx`
            ];

            const result = templates[Math.floor(Math.random() * templates.length)];

            const resultBox = document.getElementById('ai-result');
            resultBox.innerText = result;
            resultBox.style.display = 'block';
            resultBox.classList.add('animate-fade-in');

            btn.innerHTML = originalText;
            btn.disabled = false;

            document.getElementById('copy-btn').style.display = 'flex';
        }, 1500);
    }

    copyAIContent() {
        const text = document.getElementById('ai-result').innerText;
        navigator.clipboard.writeText(text);
        alert('تم نسخ النص!');
    }

    // Helper
    generatePropertiesTable(list) {
        if (!list.length) return '<div style="text-align:center; padding:2rem; color:var(--text-muted);">لا توجد عقارات</div>';

        return `
        <div style="overflow-x:auto;">
            <table style="width:100%; border-collapse:collapse; min-width:600px;">
                <thead>
                    <tr style="text-align:right; border-bottom:1px solid var(--glass-border); color:var(--text-muted);">
                        <th style="padding:1rem;">العقار</th>
                        <th style="padding:1rem;">المنطقة</th>
                        <th style="padding:1rem;">السعر</th>
                        <th style="padding:1rem;">المساحة</th>
                        <th style="padding:1rem;">الحالة</th>
                    </tr>
                </thead>
                <tbody>
                    ${list.map(p => `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.03);">
                            <td style="padding:1rem;">
                                <div style="font-weight:600;">${p.title}</div>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${p.dateAdded}</div>
                            </td>
                            <td style="padding:1rem;"><i class="fa-solid fa-location-dot text-gold"></i> ${p.location}</td>
                            <td style="padding:1rem; font-weight:700;">${p.price.toLocaleString()} ج.م</td>
                            <td style="padding:1rem;">${p.area} م²</td>
                            <td style="padding:1rem;">
                                <span style="padding:0.25rem 0.75rem; border-radius:20px; background:${p.status === 'available' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; color:${p.status === 'available' ? '#34d399' : '#f87171'}; font-size:0.85rem;">
                                    ${p.status === 'available' ? 'متاح' : 'مباع/مؤجر'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        `;
    }
}

// Global accessor
window.app = new App();
