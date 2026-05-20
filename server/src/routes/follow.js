const router = require('express').Router();
const controller = require('../controllers/follow');

router.post('/:id/request', controller.sendFollowRequest); // sendFollowRequest
router.delete('/:id/request', controller.cancelFollowRequest); // cancelFollowRequest

router.post('/requests/:id/accept', controller.acceptFollowRequest); // acceptFollowRequest
router.delete('/requests/:id/reject', controller.rejectFollowRequest); // rejectFollowRequest

router.get('/requests/received', controller.getReceivedFollowRequests); // getReceivedFollowRequests
router.get('/requests/sent', controller.getSentFollowRequests); // getSentFollowRequests

// router.delete('/:id'); // unfollowUser
// router.delete('/:id/follower'); // removeFollower

// router.get('/:id/followers'); // getFollowers
// router.get('/:id/following'); // getFollowing

module.exports = router;