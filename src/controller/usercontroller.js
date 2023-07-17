const userDb = require('../model/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { nameRegex, passwordRegex, emailRegex, isvalidBody, isValid, isValidField } = require('../validation/userValidation')

const signup = async (req, res) => {
    try {
        const data = req.body;
        const { firstName, lastName, email, confirmEmail, password, residence, profession } = data

        if (!isvalidBody(data)) return res.status(400).json({ status: false, message: "Body can't be empty please enter some data" })
        if (!isValid(firstName)) return res.status(400).json({ status: false, message: "First name is required" })
        if (!nameRegex.test(firstName)) return res.status(406).json({ status: false, message: "First name is not valid" })
        if (lastName) {
            if (!isValid(lastName)) return res.status(400).json({ status: false, message: "Last name is required" })
            if (!nameRegex.test(lastName)) return res.status(406).json({ status: false, message: "Lastt name is not valid" })
        }
        if (!isValid(email)) return res.status(400).json({ status: false, message: "Email is required" })
        if (!emailRegex.test(email)) return res.status(406).json({ status: false, message: "Email Id is not valid" })
        if (confirmEmail) {
            if (!isValid(confirmEmail)) return res.status(400).json({ status: false, message: "confirm-Email is required" })
            if (!emailRegex.test(confirmEmail)) return res.status(406).json({ status: false, message: "Confirm-Email Id is not valid" })
        }
        if (!isValid(password)) return res.status(406).json({ status: false, message: "password is required" })
        if (!passwordRegex.test(password)) return res.status(406).json({ status: false, message: "Password is not valid" })
        if (!isValid(residence)) return res.status(400).json({ status: false, message: "Residence is required" })
        if (!isValid(profession)) return res.status(400).json({ status: false, message: "Profession is required" })

        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await userDb.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: false, message: "Email already exists" });
        }

        const createUser = new userDb({ firstName, lastName, email, confirmEmail, password: hashedPassword, residence, profession });
        await createUser.save();

        const token = jwt.sign({ userId: createUser._id }, 'Prince-123');

        return res.status(201).json({ status: true, message: "Signup successful", data: createUser, token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};


const login = async (req, res) => {
    try {
        const data = req.body
      const { email, password } = data;
      if (!isvalidBody(data)) return res.status(400).json({ status: false, message: "Body can't be empty please enter some data" })
      if (!isValid(email)) return res.status(400).json({ status: false, message: "Email is required" })
      if (!emailRegex.test(email)) return res.status(406).json({ status: false, message: "Email Id is not valid" })
      if (!isValid(password)) return res.status(406).json({ status: false, message: "password is required" })
      if (!passwordRegex.test(password)) return res.status(406).json({ status: false, message: "Password is not valid" })
  
      const user = await userDb.findOne({ email });
      if (!user) {
        return res.status(401).json({ status: false, message: "Invalid email" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ status: false, message: "Invalid password" });
      }
      const token = jwt.sign({ userId: user._id }, 'Prince-123'); 
  
      return res.status(200).json({ status: true, message: "Login successful", data: { user, token } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  };
  
module.exports = { signup, login };
