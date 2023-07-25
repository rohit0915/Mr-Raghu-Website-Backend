require('dotenv').config()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminDb = require('../model/adminModel');
const courseDb = require('../model/courseModel');
const userDb = require('../model/userModel');
const ProgressDB = require('../model/courseProgessModel');
const InstructorDb = require('../model/instructorModel');
const reviewDb = require('../model/reviewModel');



const { nameRegex, passwordRegex, emailRegex, mobileRegex, objectId, isValidBody, isValid, isValidField } = require('../validation/commonValidation')



const registerAdmin = async (req, res) => {
    try {
        const { username, email, password, confirmPassword, mobileNumber } = req.body;

        if (!isValidBody(req.body)) {
            return res.status(400).json({ status: 400, message: "Body can't be empty, please enter some data" });
        }
        if (!isValid(email)) {
            return res.status(400).json({ status: 400, message: "Email is required" });
        }
        if (!emailRegex.test(email)) {
            return res.status(406).json({ status: 406, message: "Email Id is not valid" });
        }
        if (!isValid(mobileNumber)) {
            return res.status(406).json({ status: 406, message: "Mobile Number is required" });
        }
        if (!mobileRegex.test(mobileNumber)) {
            return res.status(406).json({ status: 406, message: "Mobile Number is not valid" });
        }
        if (!isValid(password)) {
            return res.status(406).json({ status: 406, message: "Password is required" });
        }
        if (!passwordRegex.test(password)) {
            return res.status(406).json({ status: 406, message: "Password is not valid" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ status: 400, message: "Password and Confirm Password must match" });
        }

        const existingAdmin = await adminDb.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ status: 409, message: 'Admin with this email already exists' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new adminDb({
            username,
            email,
            password: hashedPassword,
            mobileNumber
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin registration successful', data: newAdmin });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while registering the admin' });
    }
};



const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!isValidBody(req.body)) return res.status(400).json({ status: 400, message: "Body can't be empty please enter some data" })
        if (!isValid(email)) return res.status(400).json({ status: 400, message: "Email is required" })
        if (!emailRegex.test(email)) return res.status(406).json({ status: 406, message: "Email Id is not valid" })
        if (!isValid(password)) return res.status(406).json({ status: 406, message: "password is required" })
        if (!passwordRegex.test(password)) return res.status(406).json({ status: 406, message: "Password is not valid" })

        const existingAdmin = await adminDb.findOne({ email });
        if (!existingAdmin) {
            return res.status(401).json({ message: 'Admin not found' });
        }
        const isPasswordMatch = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ status: 401, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ adminId: existingAdmin._id, userType: 'Admin' }, process.env.ADMIN_SECRET_KEY, { expiresIn: '24h' });

        res.status(200).json({ status: 200, message: 'Admin logged in successfully', existingAdmin, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while logging in' });
    }
};



const getAllUsers = async (req, res) => {
    try {
        const users = await userDb.find();
        if (!users) {
            return res.status(404).json({ status: 404, message: 'No data found' });
        }

        res.status(200).json({ status: 200, users: users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching users' });
    }
};



const getSpecificUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await userDb.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        res.status(200).json({ status: 200, message: 'User retrieved successfully', data: user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the user' });
    }
};




const getUserCourses = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("userId", userId);

        const user = await userDb.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        const checkCourse = user.enrolledCourses;
        console.log("checkCourse", checkCourse);
        const courseIds = [];
        for (const progressId of checkCourse) {
            const progress = await ProgressDB.findById(progressId);
            if (progress) {
                courseIds.push(progress.courseId);
            }
        }
        console.log("courseIds", courseIds);
        const courses = await courseDb.find({ _id: { $in: courseIds } });
        console.log("courses", courses);
        if (courses.length === 0) {
            return res.status(404).json({ status: 404, message: "Course not found" });
        }

        res.status(200).json({ status: 200, message: 'User courses retrieved successfully', data: courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching user courses' });
    }
};



const adminCanGetOngoingCourses = async (req, res) => {
    try {
        const userId = req.params.userId;
        console.log("userId", userId);

        const checkUser = await userDb.findById(userId);
        if (!checkUser) {
            return res.status(404).json({ status: 404, message: "User not found" });
        }
        const enrolledCourses = checkUser.enrolledCourses;
        console.log("enrolledCourses", enrolledCourses);
        const validCourseData = [];
        for (const progressId of enrolledCourses) {
            const progress = await ProgressDB.findById(progressId);
            if (progress && progress.courseStatus === "ongoing") {
                const courseId = progress.courseId;
                const course = await courseDb.findById(courseId);
                if (course) {
                    validCourseData.push({ progress, course });
                }
            }
        }
        console.log("validCourseData", validCourseData);

        if (validCourseData.length === 0) {
            return res.status(400).json({ status: 400, message: "No Data Found" });
        }

        res.status(200).json({ status: 200, message: "Data get successfully", data: validCourseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while fetching the courses' });
    }
};





module.exports = { registerAdmin, loginAdmin, getAllUsers, getSpecificUser, getUserCourses, adminCanGetOngoingCourses };
