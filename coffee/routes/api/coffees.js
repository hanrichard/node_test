const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Coffee = require('../../models/Coffee');
const User = require('../../models/User');

// @route    POST api/posts
// @desc     Create a cafe
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const nnnnewCoffee = new Coffee({
        text: req.body.text,
        address: req.body.address,
        suburb: req.body.suburb,
        name: req.body.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const coffee = await nnnnewCoffee.save();

      res.json(coffee);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);


// @route    GET api/posts
// @desc     Get all posts
// @access   Private
router.get('/', async (req, res) => {
  let sortby = req.query.sortby;
  const label = {
    highest: 'averageReview',
    loweset: 'averageReview',
    most: 'totalReview',
    least: 'totalReview'
  }
  const labelValue = {
    highest: '-1',
    loweset: '1',
    most: '-1',
    least: '1'
  }

  const sortbyLabel = label[sortby]
  const sortValue = labelValue[sortby]

  var sortbyObj = {};
  sortbyObj[sortbyLabel] = sortValue;

  try {
    const posts = await Coffee.find().sort(sortbyObj);
    // const posts = await Post.find().sort({ date: 1 }).skip(1).limit(2);
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/posts/:id
// @desc     Get cafe by ID
// @access   Private
router.get('/:id', async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    const totalReviewNumber = coffee.comments && coffee.comments.reduce((comment, currentValue) => {
      return comment + Number(currentValue.review)
    }, 0) 

    const totalReview = coffee.comments && coffee.comments.length
    const averageReview = (totalReviewNumber/totalReview).toFixed(2)

    coffee['averageReview'] = coffee.comments ? averageReview : 0;
    coffee['totalReview'] = coffee.comments ? totalReview : 0;

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !coffee) {
      return res.status(404).json({ msg: 'Coffee not found' });
    }

    await coffee.save();
    
    res.json(coffee);
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Coffee.findById(req.params.id);

    // Check for ObjectId format and post
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/) || !post) {
      return res.status(404).json({ msg: 'Coffee not found' });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();

    res.json({ msg: 'Coffee removed' });
  } catch (err) {
    console.error(err.message);

    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Coffee.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: 'Coffee already liked' });
    }

    post.likes.unshift({ user: req.user.id });

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Coffee.findById(req.params.id);

    // Check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'Coffee has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty(),
      check('review', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const coffee = await Coffee.findById(req.params.id);
      
      const newComment = {
        text: req.body.text,
        review: req.body.review,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      coffee.comments.unshift(newComment);

      await coffee.save();

      res.json(coffee.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Coffee.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );
    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }
    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    post.comments = post.comments.filter(
      ({ id }) => id !== req.params.comment_id
    );

    await post.save();

    return res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

module.exports = router;
