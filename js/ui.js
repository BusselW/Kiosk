const UI = {
    elements: {
        appContent: document.getElementById('app-content'),
        btnUser: document.getElementById('btn-view-user'),
        btnAdmin: document.getElementById('btn-view-admin')
    },

    init: () => {
        UI.elements.btnUser.addEventListener('click', () => App.switchView('user'));
        UI.elements.btnAdmin.addEventListener('click', () => App.switchView('admin'));
    },

    renderLoading: () => {
        UI.elements.appContent.innerHTML = '<div id="loading">Loading data...</div>';
    },

    renderAdminView: (recentPages, kioskItems) => {
        const container = document.createElement('div');
        container.className = 'admin-grid';

        // Panel 1: Recent Site Pages
        const pagesPanel = document.createElement('div');
        pagesPanel.className = 'panel';
        pagesPanel.innerHTML = `<h2>Recent Site Pages (Last ${Config.recentDaysThreshold} days)</h2>`;
        const pagesList = document.createElement('ul');
        pagesList.className = 'item-list';

        if (recentPages && recentPages.d && recentPages.d.results) {
            recentPages.d.results.forEach(page => {
                // Check if already in Kiosk
                const isTracked = kioskItems.d.results.some(k => k[Config.fields.kiosk.originalId] === page.Id);
                
                const li = document.createElement('li');
                li.className = 'item-entry';
                li.innerHTML = `
                    <div>
                        <strong>${page.Title}</strong><br>
                        <small>Created: ${new Date(page.Created).toLocaleDateString()}</small>
                    </div>
                    ${!isTracked ? `<button class="btn-action" onclick="App.addToKiosk(${page.Id})">Add to Kiosk</button>` : '<span>Tracked</span>'}
                `;
                pagesList.appendChild(li);
            });
        } else {
            pagesList.innerHTML = '<li>No recent pages found.</li>';
        }
        pagesPanel.appendChild(pagesList);

        // Panel 2: Kiosk List Management
        const kioskPanel = document.createElement('div');
        kioskPanel.className = 'panel';
        kioskPanel.innerHTML = `<h2>Kiosk Active Items</h2>`;
        const kioskList = document.createElement('ul');
        kioskList.className = 'item-list';

        if (kioskItems && kioskItems.d && kioskItems.d.results) {
            kioskItems.d.results.forEach(item => {
                const status = item[Config.fields.kiosk.status];
                const li = document.createElement('li');
                li.className = 'item-entry';
                li.innerHTML = `
                    <div>
                        <strong>${item.Title}</strong><br>
                        <small>Status: ${status}</small>
                    </div>
                    <button class="btn-action" onclick="App.toggleStatus(${item.Id}, '${status}')">
                        ${status === 'Actief' ? 'Deactivate' : 'Activate'}
                    </button>
                `;
                kioskList.appendChild(li);
            });
        } else {
            kioskList.innerHTML = '<li>No items in Kiosk list.</li>';
        }
        kioskPanel.appendChild(kioskList);

        container.appendChild(pagesPanel);
        container.appendChild(kioskPanel);
        
        UI.elements.appContent.innerHTML = '';
        UI.elements.appContent.appendChild(container);
    },

    renderUserView: (kioskItems) => {
        // Placeholder for User View
        const container = document.createElement('div');
        container.className = 'user-view';
        container.innerHTML = '<h2>Active Kiosk Items</h2>';
        
        const list = document.createElement('ul');
        list.className = 'item-list';

        if (kioskItems && kioskItems.d && kioskItems.d.results) {
            const activeItems = kioskItems.d.results.filter(item => item[Config.fields.kiosk.status] === 'Actief');
            
            if(activeItems.length > 0) {
                activeItems.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'item-entry';
                    // Assuming PageUrl is a URL field object
                    const url = item[Config.fields.kiosk.pageUrl] ? item[Config.fields.kiosk.pageUrl].Url : '#';
                    li.innerHTML = `
                        <a href="${url}" target="_blank"><strong>${item.Title}</strong></a>
                    `;
                    list.appendChild(li);
                });
            } else {
                list.innerHTML = '<li>No active items to display.</li>';
            }
        }
        container.appendChild(list);
        
        UI.elements.appContent.innerHTML = '';
        UI.elements.appContent.appendChild(container);
    }
};
