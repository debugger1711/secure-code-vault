const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const snippetController = require('../controllers/snippetController');
const auth = require('../middleware/auth');

const VALID_LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'cpp', 'c',
  'csharp', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'sql', 'bash',
  'html', 'css', 'json', 'yaml', 'markdown', 'other'];

const snippetValidation = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be 1–100 characters'),
  body('language').isIn(VALID_LANGUAGES).withMessage('Invalid language'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description too long'),
  body('tags').optional().isArray({ max: 10 }).withMessage('Max 10 tags'),
  body('content').notEmpty().withMessage('Code content required')
];

router.use(auth);

router.get('/stats', snippetController.getStats);
router.get('/', snippetController.getSnippets);
router.get('/:id', snippetController.getSnippet);
router.post('/', snippetValidation, snippetController.createSnippet);
router.put('/:id', snippetController.updateSnippet);
router.delete('/:id', snippetController.deleteSnippet);

module.exports = router;
