const express = require('express');
const router = express.Router();
const authenticateUser = require("../middleware/auth");
const userController = require("../controller/usercontroller");
const courseController = require('../controller/courseController');
const helpController = require('../controller/helpController');
const cartController = require('../controller/cartcontroller');
const reviewController = require('../controller/reviewController');
const progressController = require('../controller/courseProgressController')


//
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: 'dcagmx6hq',
    api_key: '152478213721556',
    api_secret: 'CgSCm_qpPVYO-E3RduGFTPmSw7Y'
});
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "images/image",
        allowed_formats: ["jpg", "jpeg", "png", "PNG", "xlsx", "xls", "pdf", "PDF"],
    },
});
const upload = multer({ storage: storage });


// user
router.post('/signup', userController.signup);
router.post('/verify-otp', userController.verifyOTP);
router.post('/resend-otp', userController.resendOTP);
router.post('/login', userController.login)
router.put('/update-user/:userId', authenticateUser.authenticateUser, authenticateUser.authorization, upload.single('profileImage'), userController.updateProfile)


// course
router.post('/courses', courseController.createCourse);
router.get('/courses/my-courses', authenticateUser.authenticateUser, courseController.getMyCourses);
router.get('/ongoing-courses', authenticateUser.authenticateUser, courseController.getOngoingCourses);
router.post('/courses/save', authenticateUser.authenticateUser, courseController.saveCourse);
router.get('/getSaved-courses', authenticateUser.authenticateUser, courseController.getSavedCourses);
router.post('/enroll', authenticateUser.authenticateUser, courseController.enrollCourse);
router.get('/courses/:courseId', courseController.getCourseDetails);


// helper
router.post('/help', authenticateUser.authenticateUser, helpController.postHelpRequest);
router.get('/help', authenticateUser.authenticateUser, helpController.getAllHelpRequests);

// cart
router.post('/cart/add', authenticateUser.authenticateUser, cartController.addToCart);
router.delete('/delete/:cartId', authenticateUser.authenticateUser, cartController.deleteCourseFromCart);
router.get('/get', authenticateUser.authenticateUser, cartController.getCart);
router.post('/buy', authenticateUser.authenticateUser, cartController.buyItemsInCart);


// review
router.post('/reviews', authenticateUser.authenticateUser, reviewController.postReview);
router.get('/courses/:courseId/reviews', reviewController.getCourseReviews);

// progress of course
router.get('/progress/:courseId', authenticateUser.authenticateUser, progressController.getProgress);
router.post('/progress/:courseId', authenticateUser.authenticateUser, progressController.updateProgress);






module.exports = router;
