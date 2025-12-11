const App = {
    state: {
        currentView: 'admin', // 'admin' or 'user'
        recentPages: [],
        kioskItems: []
    },

    init: async () => {
        console.log("Initializing Kiosk App...");
        UI.init();
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
            UI.renderAdminView(App.state.recentPages, App.state.kioskItems);
        } else {
            UI.renderUserView(App.state.kioskItems);
        }
    },

    switchView: (viewName) => {
        App.state.currentView = viewName;
        // Update buttons
        document.getElementById('btn-view-user').className = viewName === 'user' ? 'active' : '';
        document.getElementById('btn-view-admin').className = viewName === 'admin' ? 'active' : '';
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
            alert("Failed to add item: " + error.message);
        }
    },

    toggleStatus: async (itemId, currentStatus) => {
        const newStatus = currentStatus === 'Actief' ? 'Niet actief' : 'Actief';
        try {
            await Api.updateKioskItemStatus(itemId, newStatus);
            await App.loadData(); // Reload to show update
            App.render();
        } catch (error) {
            alert("Failed to update status: " + error.message);
        }
    }
};

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', App.init);
