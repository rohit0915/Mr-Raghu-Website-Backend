const userDb = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('../middleware/cloudinaryConfig');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const { nameRegex, passwordRegex, emailRegex, mobileRegex,  objectId, isValidBody, isValid, isValidField } = require('../validation/commonValidation')

const accountSid = 'AC925de06ab8b9f37be27dd007becc2b19';
const authToken = 'a5540c992cea4645a7592e9882241c53';
const twilioClient = twilio(accountSid, authToken);
// const twilioClient = twilio('AC925de06ab8b9f37be27dd007becc2b19', '9a385cb95e8da90639430b25b5abddb9');


const signup = async (req, res) => {
  const { email, mobileNumber, password, confirmPassword } = req.body;

  try {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await userDb.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 400, message: "Email already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = new userDb({
      email,
      mobileNumber,
      password: hashedPassword,
      otp,
    });

    await user.save();

    // const token = jwt.sign({ userId: user._id }, 'Prince-123');

    twilioClient.messages
      .create({
        body: `Your OTP for signup is: ${otp}`,
        from: '+15739833421',
        to: "+91" + mobileNumber,
      })
      .then((message) => {
        console.log(`SMS sent with SID: ${message.sid}`);
        res.status(201).json({ status: 201, message: "Signup successful", user, /*token*/ });
      })
      .catch((error) => {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: 'Failed to send OTP via SMS' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await userDb.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    if (user.otp !== otp) {
      return res.status(401).json({ status: 401, message: "Invalid OTP" });
    }
    user.isVerified = true;
    await user.save();
    //const token = jwt.sign({ userId: user._id }, 'Prince-123');

    res.status(200).json({ status: 200, message: "OTP verified successfully", /*token*/ });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await userDb.findOne({ email });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update the user's OTP in the database
    user.otp = otp;
    await user.save();

    // Send the new OTP via SMS
    twilioClient.messages
      .create({
        body: `Your new OTP for signup is: ${otp}`,
        from: '+15739833421',
        to: "+91" + user.mobileNumber,
      })
      .then((message) => {
        console.log(`SMS sent with SID: ${message.sid}`);
        res.status(200).json({ status: 200, message: "OTP resent successfully" });
      })
      .catch((error) => {
        console.error('Error sending SMS:', error);
        res.status(500).json({ error: 'Failed to resend OTP via SMS' });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

const login = async (req, res) => {
  try {
    const data = req.body
    const { email, password } = data;
    if (!isValidBody(data)) return res.status(400).json({ status: 400, message: "Body can't be empty please enter some data" })
    if (!isValid(email)) return res.status(400).json({ status: 400, message: "Email is required" })
    if (!emailRegex.test(email)) return res.status(406).json({ status: 406, message: "Email Id is not valid" })
    if (!isValid(password)) return res.status(406).json({ status: 406, message: "password is required" })
    if (!passwordRegex.test(password)) return res.status(406).json({ status: 406, message: "Password is not valid" })
    const user = await userDb.findOne({ email });
    if (!user) {
      return res.status(401).json({ status: 401, message: "Invalid email" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 401, message: "Invalid password" });
    }
    const token = jwt.sign({ userId: user._id }, 'Prince-123');

    return res.status(200).json({ status: 200, message: "Login successful", data: { user, token } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const data = req.body;
    const { firstName, lastName, schoolName, qualification } = data;
    let profileImage;

    if (req.file) {
      profileImage = req.file ? req.file.path : "";
    }
    if(!firstName || !lastName || !schoolName || !qualification){
      return res.status(400).json({ status: 400, message: "firstName, lastName, schoolName, qualification  is required" });
    }
    if (!isValidField(firstName)) {
      return res.status(400).json({ status: 400, message: "First name is required" });
    }
    if (!nameRegex.test(firstName)) {
      return res.status(406).json({ status: 406, message: "First name is not valid" });
    }

    if (!isValidField(lastName)) {
      return res.status(400).json({ status: 400, message: "Last name is required" });
    }
    if (!nameRegex.test(lastName)) {
      return res.status(406).json({ status: 406, message: "Last name is not valid" });
    }
    if (!isValid(schoolName)) return res.status(400).json({ status: 400, message: "School/Institution name is required" })
    if (!isValid(qualification)) return res.status(400).json({ status: 400, message: "Qualification is required" })

    updatedUser = await userDb.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      schoolName,
      qualification,
      profileImage,
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    return res.status(200).json({ status: 200, message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};



module.exports = { signup, verifyOTP, resendOTP, login, updateProfile };
