import algoliasearch from "algoliasearch";

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
        const query = Array.isArray(tags) && tags.length > 0 ? tags.join(" ") : "";
        const filters = category ? `category:${category}` : undefined;
        const { hits } = await this.index.search(query, {
            hitsPerPage: Number(limit) || 10,
            filters,
            attributesToRetrieve: ["id", "objectID"],
        });
        return (hits || []).map((h) => h.id || h.objectID).filter(Boolean);
    },
};

export default algolia;