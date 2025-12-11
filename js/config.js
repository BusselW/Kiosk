const Config = {
    // Base URLs
    siteUrl: "https://som.org.om.local/sites/MulderT",
    subSiteUrl: "https://som.org.om.local/sites/muldert/onderdelen/beoordelen/verkeersborden",
    
    // List Names
    kioskListName: "KioskLijst",
    sitePagesLibrary: "SitePages",

    // Settings
    recentDaysThreshold: 14, // 2 weeks
    
    // Field Names (Internal Names)
    fields: {
        kiosk: {
            title: "Title",
            pageUrl: "PageUrl",
            status: "Status",
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
