const router = require('express').Router();
const controller = require('../controllers/follow');

router.post('/:id/request', controller.sendFollowRequest); // sendFollowRequest
// router.delete('/:id/request'); // cancelFollowRequest

// router.post('/requests/:id/accept'); // acceptFollowRequest
// router.delete('/requests/:id/reject'); // rejectFollowRequest

// router.get('/requests/received'); // getReceivedFollowRequests
// router.get('/requests/sent'); // getSentFollowRequests

// router.delete('/:id'); // unfollowUser

// router.get('/:id/followers'); // getFollowers
// router.get('/:id/following'); // getFollowing

module.exports = router;