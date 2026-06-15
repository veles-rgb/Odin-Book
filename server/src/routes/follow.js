const router = require('express').Router();
const controller = require('../controllers/follow');

const {
    userIdValidation,
    userIdentifierValidation,
    followRequestIdValidation,
} = require('../validators/followValidator');

const validate = require('../middleware/validate');

router.post(
    '/:id/request',
    userIdValidation,
    validate,
    controller.sendFollowRequest,
);

router.delete(
    '/:id/request',
    userIdValidation,
    validate,
    controller.cancelFollowRequest,
);

router.post(
    '/requests/:id/accept',
    followRequestIdValidation,
    validate,
    controller.acceptFollowRequest,
);

router.delete(
    '/requests/:id/reject',
    followRequestIdValidation,
    validate,
    controller.rejectFollowRequest,
);

router.get('/requests/received', controller.getReceivedFollowRequests);

router.get('/requests/sent', controller.getSentFollowRequests);

router.delete(
    '/:id',
    userIdValidation,
    validate,
    controller.unfollowUser,
);

router.delete(
    '/:id/follower',
    userIdValidation,
    validate,
    controller.removeFollower,
);

router.get(
    '/:id/followers',
    userIdentifierValidation,
    validate,
    controller.getFollowers,
);

router.get(
    '/:id/following',
    userIdentifierValidation,
    validate,
    controller.getFollowing,
);

module.exports = router;