const App = {
    state: {
        currentView: 'user', // Default to user view
        userTab: 'Actief', // 'Actief', 'Niet actief', 'All'
        recentPages: [],
        kioskItems: [],
        isAdmin: false
    },

    init: async () => {
        console.log("Initializing Kiosk App...");
        UI.init();
        
        // Check permissions first
        App.state.isAdmin = await Api.isUserInAnyGroup(Config.adminGroups);
        if (App.state.isAdmin) {
            UI.showAdminButton();
        }

        await App.loadData();
        App.render();
    },

    loadData: async () => {
        UI.renderLoading();
        
        // Helper to handle individual promise failures
        const fetchSafe = async (promise, name) => {
            try {
                return await promise;
            } catch (e) {
                console.warn(`Failed to load ${name}:`, e);
                return null;
            }
        };

        try {
            // Fetch data in parallel but handle errors individually
            const [pages, items] = await Promise.all([
                fetchSafe(Api.getRecentSitePages(), 'SitePages'),
                fetchSafe(Api.getKioskItems(), 'KioskItems')
            ]);
            
            if (pages) App.state.recentPages = pages;
            if (items) App.state.kioskItems = items;
            
            console.log("Data loaded", App.state);
            
            // If both failed, show error
            if (!pages && !items) {
                throw new Error("Could not load any data. Please check List names and URLs in config.js");
            }
        } catch (error) {
            console.error("Error loading data", error);
            document.getElementById('app-content').innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
        }
    },

    render: () => {
        if (App.state.currentView === 'admin') {
            if (!App.state.isAdmin) {
                App.switchView('user'); // Security fallback
                return;
            }
            UI.renderAdminView(App.state.recentPages, App.state.kioskItems);
        } else {
            UI.renderUserView(App.state.kioskItems, App.state.userTab);
        }
    },

    switchView: (viewName) => {
        App.state.currentView = viewName;
        
        // Update header buttons
        const btnUser = document.getElementById('btn-view-user');
        const btnAdmin = document.getElementById('btn-view-admin');
        
        if(btnUser) btnUser.className = viewName === 'user' ? 'active' : '';
        if(btnAdmin) btnAdmin.className = viewName === 'admin' ? 'active' : '';
        
        App.render();
    },

    switchUserTab: (tabName) => {
        App.state.userTab = tabName;
        App.render();
    },

    // Actions
    addToKiosk: async (pageId) => {
        const page = App.state.recentPages.d.results.find(p => p.Id === pageId);
        if (!page) return;

        try {
            await Api.addToKiosk(page);
            await App.loadData(); // Reload to show update
            App.render();
        } catch (error) {
            alert("Fout bij toevoegen item: " + error.message);
        }
    },

    activateItem: async (itemId) => {
        try {
            await Api.updateKioskItemStatus(itemId, 'Actief');
            await App.loadData();
            App.render();
        } catch (error) {
            alert("Fout bij activeren: " + error.message);
        }
    },

    deactivateItem: async (itemId) => {
        const input = document.getElementById(`result-input-${itemId}`);
        const resultText = input ? input.value : '';

        if (!resultText) {
            if(!confirm("Weet u zeker dat u dit item wilt deactiveren zonder resultaat in te vullen?")) {
                return;
            }
        }

        try {
            await Api.updateKioskItemStatus(itemId, 'Niet actief', resultText);
            await App.loadData();
            App.render();
        } catch (error) {
            alert("Fout bij deactiveren: " + error.message);
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
