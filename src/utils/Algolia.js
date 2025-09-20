import { algoliasearch } from "algoliasearch";

const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_ADMIN_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || "contents";

let client;
let index;

if (appId && apiKey) {
    client = algoliasearch(appId, apiKey);
    index = client.initIndex(indexName);
}

export const algolia = {
    enabled: Boolean(appId && apiKey),
    index,
    async searchSimilar({ category, tags = [], limit = 10 }) {
        if (!this.enabled || !this.index) return [];
        
        // Se não há tags nem categoria, retorna vazio
        if ((!Array.isArray(tags) || tags.length === 0) && !category) {
            return [];
        }
        
        const query = Array.isArray(tags) && tags.length > 0 ? tags.join(" ") : "*";
        const filters = category ? `category:${category}` : undefined;
        
        try {
            const { hits } = await this.index.search(query, {
                hitsPerPage: Number(limit) || 10,
                filters,
                attributesToRetrieve: ["id", "objectID"],
            });
            return (hits || []).map((h) => h.id || h.objectID).filter(Boolean);
        } catch (error) {
            console.error('Algolia search error:', error);
            return [];
        }
    },
    
    async saveObject(object) {
        if (!this.enabled || !this.index) return false;
        try {
            await this.index.saveObject(object);
            return true;
        } catch (error) {
            console.error('Algolia save error:', error);
            return false;
        }
    },
    
    async deleteObject(objectID) {
        if (!this.enabled || !this.index) return false;
        try {
            await this.index.deleteObject(objectID);
            return true;
        } catch (error) {
            console.error('Algolia delete error:', error);
            return false;
        }
    },
    
    async batchSaveObjects(objects) {
        if (!this.enabled || !this.index) return false;
        try {
            await this.index.saveObjects(objects);
            return true;
        } catch (error) {
            console.error('Algolia batch save error:', error);
            return false;
        }
    },
};

export default algolia;