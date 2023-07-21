const courseDb = require('../model/courseModel');
const userDb = require('../model/userModel');
const ProgressDB = require('../model/courseProgessModel');
const mongoose = require('mongoose');

const { nameRegex, passwordRegex, emailRegex, objectId, isValidBody, isValid, isValidField } = require('../validation/commonValidation')


const createCourse = async (req, res) => {
  try {
    const data = req.body
    const { title, description, instructor, duration, price, lessons, weeks } = data;

    if (!isValidBody(data)) return res.status(400).json({ status: 400, message: "Body can't be empty please enter some data" })
    if (!isValid(title)) return res.status(400).json({ status: 400, message: "Title is required" })
    if (!isValid(description)) return res.status(400).json({ status: 400, message: "Description is required" })
    if (!isValid(instructor)) return res.status(400).json({ status: 400, message: "Instructor is required" })
    if (!isValid(duration)) return res.status(400).json({ status: 400, message: "Duration is required" })
    if (!isValid(price)) return res.status(400).json({ status: 400, message: "Price is required" })
    if (!isValid(lessons)) return res.status(400).json({ status: 400, message: "lesson is required" })
    if (!isValid(weeks)) return res.status(400).json({ status: 400, message: "Weeks is required" })


    const newCourse = new courseDb({
      title,
      description,
      instructor,
      duration,
      price,
      lessons,
      weeks,
    });

    const savedCourse = await newCourse.save();

    return res.status(201).json({ status: 201, message: "Course created successfully", data: savedCourse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseId = req.params.courseId
    console.log("userId", userId);
    const checkUser = await userDb.findById(userId)
    if (!checkUser) {
      return res.status(404).json({ status: 404, message: "User not found" })
    }
    const courses = await userDb.find({ enrolledCourses: courseId });
    if (courses.length === 0) {
      return res.status(400).json({ status: 400, message: "No Data Found" });
    }
    console.log("courses", courses);
    res.status(200).json({ status: 200, message: "Data get successfully", data: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the courses' });
  }
}


const getOngoingCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("userId", userId);
    const checkUser = await userDb.findById(userId);
    if (!checkUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const courses = await courseDb.find({ "enrolledUsers.userId": userId, "enrolledUsers.status": "ongoing" });
    console.log("courses", courses);
    if (courses.length === 0) {
      return res.status(400).json({ status: 400, message: "No Data Found" });
    }
    res.status(200).json({ status: 200, message: "Data get successfully", data: courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the courses' });
  }
};


const saveCourse = async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseId = req.body.courseId;

    const user = await userDb.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const course = await courseDb.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 404, message: "Course not found" });
    }
    if (user.savedCourses.includes(courseId)) {
      return res.status(400).json({ status: 400, message: "Course is already saved" });
    }
    user.savedCourses.push(courseId);
    await user.save();

    course.savedStatus = true;
    await course.save();

    res.status(200).json({ status: 200, message: "Course saved successfully", data: course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while saving the course' });
  }
};



const getSavedCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("userId", userId);
    const checkUser = await userDb.findById(userId)
    if (!checkUser) {
      return res.status(404).json({ status: 404, message: "User not found" })
    }
    const user = await userDb.findById(userId).populate('savedCourses');
    console.log("user", user.savedCourses);

    if (user.savedCourses.length === 0) {
      res.status(200).json({ status: 200, message: "No saved courses found", data: [] });
    } else {
      res.status(200).json({ status: 200, message: "Data retrieved successfully", data: user.savedCourses });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the courses' });
  }
};



// const enrollInCourse = async (req, res) => {
//   try {
//     const courseId = req.body.courseId;
//     console.log("courseId", courseId);
//     const userId = req.user.userId;
//     console.log("userId", userId);
//     const user = await userDb.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }

//     const course = await courseDb.findById(courseId);
//     console.log("course", course);

//     if (!course) {
//       return res.status(404).json({ error: 'Course not found' });
//     }

//     if (course.enrolledUsers.includes(userId)) {
//       return res.status(400).json({ error: 'User is already enrolled in the course' });
//     }
//     course.enrolledUsers.push(userId);
//     const getData = await course.save();
//     console.log("getData", getData);

//     res.status(200).json({ status: 200, message: 'Enrolled in the course successfully', data: getData });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while enrolling in the course' });
//   }
// }

const enrollCourse = async (req, res) => {
  try {
      const userId = req.user.userId;
      const courseId = req.body.courseId;

      const checkUserser = await userDb.findById(userId);
    if (!checkUserser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }  
    const checkCourseUser = await courseDb.findById(courseId)
    if(!checkCourseUser){
      return res.status(404).json({ status: 404, message: "Course not found" });
    }
      const progress = new ProgressDB({ userId, courseId, completedLessons: 0 });
      await progress.save();

      const user = await userDb.findByIdAndUpdate(userId, { $push: { enrolledCourses: progress._id } }, { new: true });
      if (!user) {
          return res.status(404).json({ status: 404, message: "User not found" });
      }

      res.status(200).json({ status: 200, message: "Course enrollment successful", data: user });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while enrolling in the course' });
  }
};


const getCourseDetails = async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await courseDb.findById(courseId);

    if (!course) {
      return res.status(404).json({ status: 404, message: "Course not found" });
    }

    res.status(200).json({ status: 200, message: "Course details retrieved successfully", data: course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the course details' });
  }
};




module.exports = {
  createCourse,
  getMyCourses,
  getOngoingCourses,
  saveCourse,
  getSavedCourses,
  enrollCourse,
  getCourseDetails
};
