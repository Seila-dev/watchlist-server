import { algoliasearch } from "algoliasearch";

const appId = process.env.ALGOLIA_APP_ID;
const apiKey = process.env.ALGOLIA_ADMIN_KEY;
const indexName = process.env.ALGOLIA_INDEX_NAME || "contents";

let client;

if (appId && apiKey) {
    client = algoliasearch(appId, apiKey);
}

export const algolia = {
    enabled: Boolean(appId && apiKey && client),
    client,
    indexName,
    
    get index() {
        return this.client ? this.client : null;
    },
    
    async searchSimilar({ category, tags = [], limit = 10, query = "" }) {
        if (!this.enabled || !this.client) return [];
        
        if (!query && (!Array.isArray(tags) || tags.length === 0) && !category) {
            return [];
        }
        
        let searchQuery = query;
        if (!searchQuery && Array.isArray(tags) && tags.length > 0) {
            searchQuery = tags.join(" ");
        }
        if (!searchQuery) {
            searchQuery = ""; 
        }
        
        let filters = "";
        if (category) {
            filters = `category:"${category}"`;
        }
        
        try {
            const searchParams = {
                hitsPerPage: Number(limit) || 10,
                attributesToRetrieve: ["id", "objectID", "title", "category", "tags"]
            };
            
            if (filters) {
                searchParams.filters = filters;
            }
            
            const { results } = await this.client.search({
                requests: [{
                    indexName: this.indexName,
                    query: searchQuery,
                    ...searchParams
                }]
            });
            
            const hits = results[0]?.hits || [];
            
            return hits.map(hit => ({
                id: hit.id || hit.objectID,
                objectID: hit.objectID,
                title: hit.title,
                category: hit.category,
                tags: hit.tags,
                _highlightResult: hit._highlightResult
            })).filter(item => item.id);
            
        } catch (error) {
            console.error('Algolia search error:', error);
            return [];
        }
    },
    
    async search({ query = "", filters = "", limit = 10, offset = 0 }) {
        if (!this.enabled || !this.client) return { hits: [], nbHits: 0 };
        
        try {
            const searchParams = {
                hitsPerPage: Number(limit) || 10,
                page: Math.floor(offset / limit) || 0
            };
            
            if (filters) {
                searchParams.filters = filters;
            }
            
            const { results } = await this.client.search({
                requests: [{
                    indexName: this.indexName,
                    query,
                    ...searchParams
                }]
            });
            
            const result = results[0] || {};
            
            return {
                hits: result.hits || [],
                nbHits: result.nbHits || 0,
                page: result.page || 0,
                nbPages: result.nbPages || 0,
                processingTimeMS: result.processingTimeMS || 0
            };
            
        } catch (error) {
            console.error('Algolia search error:', error);
            return { hits: [], nbHits: 0 };
        }
    },
    
    async saveObject(object) {
        if (!this.enabled || !this.client) return false;
        
        if (!object.objectID && !object.id) {
            console.error('Object must have objectID or id');
            return false;
        }
        
        if (!object.objectID) {
            object.objectID = object.id;
        }
        
        try {
            await this.client.saveObject({
                indexName: this.indexName,
                body: object
            });
            return true;
        } catch (error) {
            console.error('Algolia save error:', error);
            return false;
        }
    },

     async partialUpdateObject(object) {
        if (!this.enabled || !this.client) return false;

        if (!object || (!object.objectID && !object.id)) {
            console.error('partialUpdateObject: object must have objectID or id');
            return false;
        }

        if (!object.objectID && object.id) {
            object.objectID = object.id;
        }

        try {
            await this.client.batch({
                indexName: this.indexName,
                batchWriteParams: {
                    requests: [
                        {
                            action: 'partialUpdateObject',
                            body: object
                        }
                    ]
                }
            });
            return true;
        } catch (error) {
            console.error('Algolia partial update error:', error);
            return false;
        }
    },
    
    async deleteObject(objectID) {
        if (!this.enabled || !this.client) return false;
        
        if (!objectID) {
            console.error('objectID is required for deletion');
            return false;
        }
        
        try {
            await this.client.deleteObject({
                indexName: this.indexName,
                objectID
            });
            return true;
        } catch (error) {
            console.error('Algolia delete error:', error);
            return false;
        }
    },
    
    async batchSaveObjects(objects) {
        if (!this.enabled || !this.client) return false;
        
        if (!Array.isArray(objects) || objects.length === 0) {
            console.error('Objects must be a non-empty array');
            return false;
        }
        
        const processedObjects = objects.map(obj => {
            if (!obj.objectID && obj.id) {
                obj.objectID = obj.id;
            }
            return obj;
        });
        
        try {
            await this.client.batch({
                indexName: this.indexName,
                batchWriteParams: {
                    requests: processedObjects.map(obj => ({
                        action: 'addObject',
                        body: obj
                    }))
                }
            });
            return true;
        } catch (error) {
            console.error('Algolia batch save error:', error);
            return false;
        }
    },
    
    async batchDeleteObjects(objectIDs) {
        if (!this.enabled || !this.client) return false;
        
        if (!Array.isArray(objectIDs) || objectIDs.length === 0) {
            console.error('objectIDs must be a non-empty array');
            return false;
        }
        
        try {
            await this.client.batch({
                indexName: this.indexName,
                batchWriteParams: {
                    requests: objectIDs.map(objectID => ({
                        action: 'deleteObject',
                        body: { objectID }
                    }))
                }
            });
            return true;
        } catch (error) {
            console.error('Algolia batch delete error:', error);
            return false;
        }
    },
    
    async clearIndex() {
        if (!this.enabled || !this.client) return false;
        
        try {
            await this.client.clearObjects({
                indexName: this.indexName
            });
            return true;
        } catch (error) {
            console.error('Algolia clear index error:', error);
            return false;
        }
    },
    
    async getSettings() {
        if (!this.enabled || !this.client) return null;
        
        try {
            return await this.client.getSettings({
                indexName: this.indexName
            });
        } catch (error) {
            console.error('Algolia get settings error:', error);
            return null;
        }
    },
    
    async setSettings(settings) {
        if (!this.enabled || !this.client) return false;
        
        try {
            await this.client.setSettings({
                indexName: this.indexName,
                indexSettings: settings
            });
            return true;
        } catch (error) {
            console.error('Algolia set settings error:', error);
            return false;
        }
    },
    
    async testConnection() {
        if (!this.enabled || !this.client) {
            return {
                success: false,
                message: 'Algolia not configured',
                details: {
                    hasAppId: !!appId,
                    hasApiKey: !!apiKey,
                    hasClient: !!this.client
                }
            };
        }
        
        try {
            const settings = await this.getSettings();
            return {
                success: true,
                message: 'Algolia connection successful',
                indexName: this.indexName,
                settings: settings ? Object.keys(settings) : null
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to connect to Algolia',
                error: error.message
            };
        }
    }
};

export default algolia;