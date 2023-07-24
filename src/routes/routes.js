const express = require('express');
const router = express.Router();

const { authenticateUser, authorizeUser, authorization, authenticateAdmin } = require("../middleware/auth");
const { signup, verifyOTP, resendOTP, login, updateProfile, getUserProfile } = require("../controller/usercontroller");
const {
    createCourse, getMyCourses, getOngoingCourses,
    saveCourse, getSavedCourses, enrollCourse, getCourseDetails, getFeaturedCourses, getPopularCourses, getCoursesByCategory,
    updateCourseVideos, updateCourseNotes, getInstructorCourses
} = require('../controller/courseController');
const {
    postHelpRequest, getAllHelpRequests,
} = require('../controller/helpController');
const {
    addToCart, deleteCourseFromCart, getCart, buyItemsInCart,
} = require('../controller/cartcontroller');
const {
    postReview, getCourseReviews,
} = require('../controller/reviewController');
const {
    getProgress, updateProgress,
} = require('../controller/courseProgressController')
const { registerInstructor, loginInstructor } = require('../controller/instructorController');



// upload image Start
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
// upload image End



// user
router.post('/signup', signup);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', login)
router.put('/update-user/:userId', authenticateUser, authorization, upload.single('profileImage'), updateProfile)
router.get('/profile/:userId', authenticateUser, authorization, getUserProfile);



// course
router.post('/courses', createCourse);
router.get('/courses/my-courses/:userId', authenticateUser, authorization, getMyCourses);
router.get('/ongoing-courses/:userId', authenticateUser, authorization, getOngoingCourses);
router.post('/courses/save/:userId', authenticateUser, authorization, saveCourse);
router.get('/getSaved-courses/:userId', authenticateUser, authorization, getSavedCourses);
router.post('/enroll/:userId', authenticateUser, authorization, enrollCourse);
router.get('/courses/:courseId', getCourseDetails);
router.get('/popular-courses', getPopularCourses);
router.get('/courses/category/:category', getCoursesByCategory);
router.put('/courses/:courseId/videos', updateCourseVideos);
router.put('/courses/:courseId/notes', updateCourseNotes);
router.get('/instructor/courses/:instructorId', getInstructorCourses);




// helper
router.post('/help/:userId', authenticateUser, authorization, postHelpRequest);
router.get('/help/:userId', authenticateUser, authorization, getAllHelpRequests);



// cart
router.post('/cart/add/:userId', authenticateUser, authorization, addToCart);
router.delete('/delete/:userId', authenticateUser, authorization, deleteCourseFromCart);
router.get('/get/:userId', authenticateUser, authorization, getCart);
router.post('/buy/:userId', authenticateUser, authorization, buyItemsInCart);



// review
router.post('/reviews/:userId', authenticateUser, authorization, postReview);
router.get('/courses/:courseId/reviews', getCourseReviews);



// progress of course
router.get('/progress/:userId', authenticateUser, authorization, authorization, getProgress);
router.post('/progress/:userId/:courseId', authenticateUser, authorization, updateProgress);



//instructor 
router.post('/Instructor-register', registerInstructor);
router.post('/Instructor-login', loginInstructor);




router.all("/*", (req, res) => { res.status(400).send({ status: false, message: "Endpoint is not correct plese provide a proper end-point" }) })


module.exports = router;
