import ContentService from '../services/ContentService.js';

class ContentController {
  async getContents(req, res) {
    try {
      const userId = req.user?.id; // vem do middleware auth
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const data = await ContentService.listContents(userId, req.query);
      return res.status(200).json(data);
    } catch (error) {
      console.error('GET /contents error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default new ContentController();
