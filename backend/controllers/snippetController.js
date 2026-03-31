const { validationResult } = require('express-validator');
const Snippet = require('../models/Snippet');
const User = require('../models/User');
const { encrypt, decrypt } = require('../utils/encryption');

// GET /api/snippets
exports.getSnippets = async (req, res) => {
  try {
    const { search, language, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (language && language !== 'all') {
      query.language = language;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .select('-encryptedContent -iv') // Don't send encrypted content in list
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Snippet.countDocuments(query)
    ]);

    res.json({
      snippets,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets.' });
  }
};

// GET /api/snippets/:id (decrypt and return)
exports.getSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found.' });
    }

    const decryptedContent = decrypt(snippet.encryptedContent, snippet.iv);
    snippet.viewCount += 1;
    await snippet.save();

    res.json({
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      content: decryptedContent,
      tags: snippet.tags,
      isFavorite: snippet.isFavorite,
      viewCount: snippet.viewCount,
      createdAt: snippet.createdAt,
      updatedAt: snippet.updatedAt
    });
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Failed to retrieve snippet.' });
  }
};

// POST /api/snippets
exports.createSnippet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, language, content, tags } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Code content is required.' });
    }

    const { encryptedData, iv } = encrypt(content);

    const snippet = new Snippet({
      user: req.user._id,
      title,
      description: description || '',
      language,
      encryptedContent: encryptedData,
      iv,
      tags: tags || []
    });

    await snippet.save();

    // Update user snippet count
    await User.findByIdAndUpdate(req.user._id, { $inc: { snippetCount: 1 } });

    res.status(201).json({
      message: 'Snippet created and encrypted successfully.',
      snippet: {
        id: snippet._id,
        title: snippet.title,
        description: snippet.description,
        language: snippet.language,
        tags: snippet.tags,
        createdAt: snippet.createdAt
      }
    });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Failed to create snippet.' });
  }
};

// PUT /api/snippets/:id
exports.updateSnippet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const snippet = await Snippet.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found.' });
    }

    const { title, description, language, content, tags, isFavorite } = req.body;

    if (title !== undefined) snippet.title = title;
    if (description !== undefined) snippet.description = description;
    if (language !== undefined) snippet.language = language;
    if (tags !== undefined) snippet.tags = tags;
    if (isFavorite !== undefined) snippet.isFavorite = isFavorite;

    if (content !== undefined) {
      const { encryptedData, iv } = encrypt(content);
      snippet.encryptedContent = encryptedData;
      snippet.iv = iv;
    }

    snippet.updatedAt = new Date();
    await snippet.save();

    res.json({ message: 'Snippet updated successfully.', snippet: {
      id: snippet._id,
      title: snippet.title,
      description: snippet.description,
      language: snippet.language,
      tags: snippet.tags,
      isFavorite: snippet.isFavorite,
      updatedAt: snippet.updatedAt
    }});
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Failed to update snippet.' });
  }
};

// DELETE /api/snippets/:id
exports.deleteSnippet = async (req, res) => {
  try {
    const snippet = await Snippet.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found.' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { snippetCount: -1 } });

    res.json({ message: 'Snippet deleted successfully.' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete snippet.' });
  }
};

// GET /api/snippets/stats
exports.getStats = async (req, res) => {
  try {
    const [total, byLanguage, recent] = await Promise.all([
      Snippet.countDocuments({ user: req.user._id }),
      Snippet.aggregate([
        { $match: { user: req.user._id } },
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Snippet.find({ user: req.user._id })
        .select('title language createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
    ]);

    res.json({ total, byLanguage, recent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
};
