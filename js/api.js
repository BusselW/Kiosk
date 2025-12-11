/**
 * Handles all SharePoint REST API interactions
 */
const Api = {
    /**
     * Generic helper for GET requests
     */
    get: async (url) => {
        try {
            const response = await fetch(url, {
                headers: {
                    "Accept": "application/json;odata=verbose"
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("API Get Error:", error);
            throw error;
        }
    },

    /**
     * Generic helper for POST requests (Create/Update)
     * Note: Requires RequestDigest for SP2019
     */
    post: async (url, data, requestDigest) => {
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": requestDigest
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("API Post Error:", error);
            throw error;
        }
    },

    /**
     * Get the FormDigestValue needed for write operations
     */
    getRequestDigest: async (siteUrl) => {
        const endpoint = `${siteUrl}/_api/contextinfo`;
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose"
                }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.d.GetContextWebInformation.FormDigestValue;
        } catch (error) {
            console.error("API GetRequestDigest Error:", error);
            throw error;
        }
    },

    /**
     * Fetch recent Site Pages from the subsite
     */
    getRecentSitePages: async () => {
        // Calculate date 2 weeks ago
        const date = new Date();
        date.setDate(date.getDate() - Config.recentDaysThreshold);
        const dateString = date.toISOString();

        // Filter: PromotedState eq 2 (News/Page) AND Created ge datetime'...'
        const filter = `PromotedState eq 2 and Created ge datetime'${dateString}'`;
        const select = `${Config.fields.sitePages.id},${Config.fields.sitePages.title},${Config.fields.sitePages.created},${Config.fields.sitePages.fileRef}`;
        
        // Escape single quotes in library name for OData query
        const libraryTitle = Config.sitePagesLibrary.replace(/'/g, "''");
        const endpoint = `${Config.subSiteUrl}/_api/web/lists/getbytitle('${libraryTitle}')/items?$filter=${filter}&$select=${select}&$orderby=Created desc`;
        
        return await Api.get(endpoint);
    },

    /**
     * Fetch current items in the Kiosk List
     */
    getKioskItems: async () => {
        const endpoint = `${Config.subSiteUrl}/_api/web/lists/getbytitle('${Config.kioskListName}')/items?$orderby=${Config.fields.kiosk.dateAdded} desc`;
        return await Api.get(endpoint);
    },

    /**
     * Add an item to the Kiosk List
     */
    addToKiosk: async (pageItem) => {
        const digest = await Api.getRequestDigest(Config.subSiteUrl);
        const endpoint = `${Config.subSiteUrl}/_api/web/lists/getbytitle('${Config.kioskListName}')/items`;
        
        const payload = {
            "__metadata": { "type": `SP.Data.${Config.kioskListName}ListItem` }, // Note: List type might need adjustment based on actual internal name
            [Config.fields.kiosk.title]: pageItem.Title,
            [Config.fields.kiosk.pageUrl]: {
                "__metadata": { "type": "SP.FieldUrlValue" },
                "Description": pageItem.Title,
                "Url": pageItem.FileRef // Note: FileRef is server relative, might need full URL depending on requirement
            },
            [Config.fields.kiosk.status]: "Actief",
            [Config.fields.kiosk.originalId]: pageItem.Id,
            [Config.fields.kiosk.dateAdded]: new Date().toISOString()
        };

        return await Api.post(endpoint, payload, digest);
    },

    /**
     * Update status of a Kiosk item
     */
    updateKioskItemStatus: async (itemId, newStatus) => {
        const digest = await Api.getRequestDigest(Config.subSiteUrl);
        const endpoint = `${Config.subSiteUrl}/_api/web/lists/getbytitle('${Config.kioskListName}')/items(${itemId})`;
        
        const payload = {
            "__metadata": { "type": `SP.Data.${Config.kioskListName}ListItem` },
            [Config.fields.kiosk.status]: newStatus
        };

        // For updates we usually need MERGE or PATCH, but standard POST with X-HTTP-Method header works in SP
        // Adding headers for update
        // This is a simplified version, might need specific headers for update
        try {
             const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Accept": "application/json;odata=verbose",
                    "Content-Type": "application/json;odata=verbose",
                    "X-RequestDigest": digest,
                    "X-HTTP-Method": "MERGE",
                    "IF-MATCH": "*"
                },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        } catch (error) {
            console.error("API Update Error:", error);
            throw error;
        }
    }
};
