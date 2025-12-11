const Config = {
    // Base URLs
    siteUrl: "https://som.org.om.local/sites/MulderT",
    subSiteUrl: "https://som.org.om.local/sites/muldert/onderdelen/beoordelen/verkeersborden",
    
    // List Names
    // Note: In Dutch environments, 'SitePages' is often 'Sitepagina\'s'. 
    // If you get a 404 on SitePages, try changing this to "Sitepagina's"
    sitePagesLibrary: "Sitepagina's", 
    kioskListName: "KioskLijst",

    // Settings
    recentDaysThreshold: 14, // 2 weeks
    
    // Field Names (Internal Names)
    fields: {
        kiosk: {
            title: "Title",
            pageUrl: "PageURL", // Updated from schema
            status: "Status_x0009_", // Updated from schema
            originalId: "OriginalId",
            dateAdded: "DateAdded"
        },
        sitePages: {
            id: "ID",
            title: "Title",
            created: "Created",
            promotedState: "PromotedState",
            fileRef: "FileRef"
        }
    }
};
