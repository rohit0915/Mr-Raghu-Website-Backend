const userDb = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cloudinary = require('../middleware/cloudinaryConfig');

const { nameRegex, passwordRegex, emailRegex, isvalidBody, isValid, isValidField } = require('../validation/userValidation')

const signup = async (req, res) => {
  try {
    const data = req.body;
    const { firstName, lastName, email, confirmEmail, password, residence, profession } = data

    if (!isvalidBody(data)) return res.status(400).json({ status: 400, message: "Body can't be empty please enter some data" })
    if (!isValid(firstName)) return res.status(400).json({ status: 400, message: "First name is required" })
    if (!nameRegex.test(firstName)) return res.status(406).json({ status: 406, message: "First name is not valid" })
    if (lastName) {
      if (!isValid(lastName)) return res.status(400).json({ status: 400, message: "Last name is required" })
      if (!nameRegex.test(lastName)) return res.status(406).json({ status: 406, message: "Lastt name is not valid" })
    }
    if (!isValid(email)) return res.status(400).json({ status: 400, message: "Email is required" })
    if (!emailRegex.test(email)) return res.status(406).json({ status: 406, message: "Email Id is not valid" })
    if (confirmEmail) {
      if (email !== confirmEmail) {
        return res.status(400).json({ status: 400, message: "Email and Confirm Email must match" });
      }
      if (!isValid(confirmEmail)) return res.status(400).json({ status: 400, message: "confirm-Email is required" })
      if (!emailRegex.test(confirmEmail)) return res.status(406).json({ status: 406, message: "Confirm-Email Id is not valid" })
    }
    if (!isValid(password)) return res.status(406).json({ status: 406, message: "password is required" })
    if (!passwordRegex.test(password)) return res.status(406).json({ status: 406, message: "Password is not valid" })
    if (!isValid(residence)) return res.status(400).json({ status: 400, message: "Residence is required" })
    if (!isValid(profession)) return res.status(400).json({ status: 400, message: "Profession is required" })

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await userDb.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: 400, message: "Email already exists" });
    }

    const createUser = new userDb({ firstName, lastName, email, password: hashedPassword, residence, profession });
    await createUser.save();

    const token = jwt.sign({ userId: createUser._id }, 'Prince-123');

    return res.status(201).json({ status: 201, message: "Signup successful", data: createUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};


const login = async (req, res) => {
  try {
    const data = req.body
    const { email, password } = data;
    if (!isvalidBody(data)) return res.status(400).json({ status: 400, message: "Body can't be empty please enter some data" })
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
    const { firstName, lastName, residence, profession, profileName } = data;
    let profileImage;

    if (req.file) {
      profileImage = req.file ? req.file.path : "";
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

      if (!isValidField(residence)) {
        return res.status(400).json({ status: 400, message: "Residence is required" });
      }

      if (!isValidField(profession)) {
        return res.status(400).json({ status: 400, message: "Profession is required" });
      }

      if (!isValidField(profileName)) {
        return res.status(400).json({ status: 400, message: "Profile name is required" });
      }
      if (!nameRegex.test(profileName)) {
        return res.status(406).json({ status: 406, message: "Profile name is not valid" });
      }

    updatedUser = await userDb.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      residence,
      profession,
      profileImage,
      profileName
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



module.exports = { signup, login, updateProfile };
