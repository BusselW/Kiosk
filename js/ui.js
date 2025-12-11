const UI = {
    elements: {
        appContent: document.getElementById('app-content'),
        btnUser: document.getElementById('btn-view-user'),
        btnAdmin: document.getElementById('btn-view-admin')
    },

    icons: {
        add: '<svg viewBox="0 0 20 20"><path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"/></svg>',
        check: '<svg viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>',
        archive: '<svg viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z"/><path fill-rule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clip-rule="evenodd"/></svg>',
        refresh: '<svg viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/></svg>',
        link: '<svg viewBox="0 0 20 20"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/></svg>'
    },

    init: () => {
        // Only User View button is needed initially if we treat them as separate "pages"
        // But keeping the switch logic for the single-page app feel
        const btnAdmin = UI.elements.btnAdmin;
        if(btnAdmin) btnAdmin.addEventListener('click', () => App.switchView('admin'));
        
        const btnUser = UI.elements.btnUser;
        if(btnUser) btnUser.addEventListener('click', () => App.switchView('user'));
    },

    showAdminButton: () => {
        UI.elements.btnAdmin.classList.add('visible');
    },

    renderLoading: () => {
        UI.elements.appContent.innerHTML = '<div id="loading">Gegevens laden...</div>';
    },

    renderTabs: (activeTab) => {
        return `
            <div class="tabs">
                <button class="tab-btn ${activeTab === 'Actief' ? 'active' : ''}" onclick="App.switchUserTab('Actief')">Actief</button>
                <button class="tab-btn ${activeTab === 'Niet actief' ? 'active' : ''}" onclick="App.switchUserTab('Niet actief')">Niet actief</button>
                <button class="tab-btn ${activeTab === 'All' ? 'active' : ''}" onclick="App.switchUserTab('All')">Alles</button>
            </div>
        `;
    },

    renderAdminView: (recentPages, kioskItems) => {
        const container = document.createElement('div');
        container.className = 'admin-grid';

        // Panel 1: Recent Site Pages
        const pagesPanel = document.createElement('div');
        pagesPanel.className = 'panel';
        pagesPanel.innerHTML = `<h2>${UI.icons.refresh} Recente Sitepagina's (Laatste ${Config.recentDaysThreshold} dagen)</h2>`;
        const pagesList = document.createElement('ul');
        pagesList.className = 'item-list';

        if (recentPages && recentPages.d && recentPages.d.results) {
            recentPages.d.results.forEach(page => {
                // Check if already in Kiosk (safely)
                const isTracked = kioskItems && kioskItems.d && kioskItems.d.results 
                    ? kioskItems.d.results.some(k => k[Config.fields.kiosk.originalId] === page.Id)
                    : false;
                
                const li = document.createElement('li');
                li.className = 'item-entry';
                li.innerHTML = `
                    <div class="item-content">
                        <a href="${page.FileRef}" target="_blank" class="item-title">${page.Title}</a>
                        <div class="item-meta">
                            <span>Aangemaakt: ${new Date(page.Created).toLocaleDateString('nl-NL')}</span>
                        </div>
                    </div>
                    ${!isTracked 
                        ? `<button class="btn-action btn-primary" onclick="App.addToKiosk(${page.Id})">${UI.icons.add} Toevoegen</button>` 
                        : `<span class="status-badge status-actief">${UI.icons.check} Gevolgd</span>`}
                `;
                pagesList.appendChild(li);
            });
        } else {
            pagesList.innerHTML = '<li>Geen recente pagina\'s gevonden (of laden mislukt).</li>';
        }
        pagesPanel.appendChild(pagesList);

        // Panel 2: Kiosk List Management
        const kioskPanel = document.createElement('div');
        kioskPanel.className = 'panel';
        kioskPanel.innerHTML = `<h2>${UI.icons.check} Kiosk Actieve Items</h2>`;
        const kioskList = document.createElement('ul');
        kioskList.className = 'item-list';

        if (kioskItems && kioskItems.d && kioskItems.d.results) {
            kioskItems.d.results.forEach(item => {
                const status = item[Config.fields.kiosk.status];
                const isActive = status === 'Actief';
                const result = item[Config.fields.kiosk.result] || '';
                
                const li = document.createElement('li');
                li.className = 'item-entry';
                
                // Build the HTML
                let html = `
                    <div class="item-content">
                        <div class="item-title">${item.Title}</div>
                        <div class="item-meta">
                            <span class="status-badge ${isActive ? 'status-actief' : 'status-niet-actief'}">
                                ${isActive ? 'Actief' : 'Niet actief'}
                            </span>
                            ${!isActive && result ? `<span class="result-display">Resultaat: ${result}</span>` : ''}
                        </div>
                        
                        <!-- Hidden input container for deactivation -->
                        <div id="deactivate-form-${item.Id}" class="result-input-container">
                            <textarea id="result-input-${item.Id}" placeholder="Vul het resultaat of de reden in..."></textarea>
                            <div style="display:flex; gap:8px; justify-content:flex-end;">
                                <button class="btn-action btn-secondary" onclick="UI.toggleDeactivateForm(${item.Id})">Annuleren</button>
                                <button class="btn-action btn-danger" onclick="App.deactivateItem(${item.Id})">Bevestigen</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="item-actions">
                        ${isActive 
                            ? `<button class="btn-action btn-danger" onclick="UI.toggleDeactivateForm(${item.Id})">${UI.icons.archive} Deactiveren</button>` 
                            : `<button class="btn-action btn-success" onclick="App.activateItem(${item.Id})">${UI.icons.check} Activeren</button>`
                        }
                    </div>
                `;
                
                li.innerHTML = html;
                kioskList.appendChild(li);
            });
        } else {
            kioskList.innerHTML = '<li>Geen items in Kiosk lijst (of lijst niet gevonden).</li>';
        }
        kioskPanel.appendChild(kioskList);

        container.appendChild(pagesPanel);
        container.appendChild(kioskPanel);
        
        UI.elements.appContent.innerHTML = '';
        UI.elements.appContent.appendChild(container);
    },

    renderUserView: (kioskItems, activeTab = 'Actief') => {
        const container = document.createElement('div');
        container.className = 'user-view-container';
        
        // Add Tabs
        container.innerHTML = UI.renderTabs(activeTab);

        const list = document.createElement('ul');
        list.className = 'compact-list';

        if (kioskItems && kioskItems.d && kioskItems.d.results) {
            // Filter based on tab
            const filteredItems = kioskItems.d.results.filter(item => {
                if (activeTab === 'All') return true;
                return item[Config.fields.kiosk.status] === activeTab;
            });
            
            if(filteredItems.length > 0) {
                filteredItems.forEach(item => {
                    const url = item[Config.fields.kiosk.pageUrl] ? item[Config.fields.kiosk.pageUrl].Url : '#';
                    const status = item[Config.fields.kiosk.status];
                    const result = item[Config.fields.kiosk.result];
                    const isInactive = status === 'Niet actief';

                    const li = document.createElement('li');
                    li.className = 'compact-item';
                    
                    let tooltipHtml = '';
                    if (isInactive && result) {
                        tooltipHtml = `<div class="tooltip-content">${result}</div>`;
                    }

                    li.innerHTML = `
                        <a href="${url}" target="_blank">${item.Title}</a>
                        ${isInactive ? `<span class="status-badge status-niet-actief" style="font-size:10px;">Gearchiveerd</span>` : ''}
                        ${tooltipHtml}
                    `;
                    list.appendChild(li);
                });
            } else {
                list.innerHTML = '<li class="compact-item" style="color:#605e5c; font-style:italic;">Geen items gevonden in deze weergave.</li>';
            }
        }
        container.appendChild(list);
        
        UI.elements.appContent.innerHTML = '';
        UI.elements.appContent.appendChild(container);
    },

    toggleDeactivateForm: (id) => {
        const form = document.getElementById(`deactivate-form-${id}`);
        if (form) {
            form.classList.toggle('visible');
            if (form.classList.contains('visible')) {
                const input = document.getElementById(`result-input-${id}`);
                if(input) input.focus();
            }
        }
    }
};
