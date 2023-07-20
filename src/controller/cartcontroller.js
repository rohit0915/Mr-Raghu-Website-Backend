// const userDb = require('../model/userModel');
// const courseDb = require('../model/courseModel');
// const cartDb = require('../model/cartModel');

// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { courseId } = req.body;

//     const user = await userDb.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }
//     const course = await courseDb.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ status: 404, message: "Course not found" });
//     }
//     if (user.cart.includes(courseId)) {
//       return res.status(400).json({ status: 400, message: "Course is already in the cart" });
//     }
//     user.cart.push(courseId);
//     await user.save();

//     res.status(200).json({ status: 200, message: "Course added to cart successfully", data: user.cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while adding the course to the cart' });
//   }
// };

// const deleteCourseFromCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const courseId = req.params.courseId;

//     const user = await userDb.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }

//     const course = await courseDb.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ status: 404, message: "Course not found" });
//     }

//     if (!user.cart.includes(courseId)) {
//       return res.status(400).json({ status: 400, message: "Course is not in the cart" });
//     }

//     user.cart = user.cart.filter((course) => course.toString() !== courseId);
//     await user.save();

//     res.status(200).json({ status: 200, message: "Course removed from the cart successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while removing the course from the cart' });
//   }
// };

// const getCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await userDb.findById(userId).populate('cart', 'title description price');
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }

//     res.status(200).json({ status: 200, message: "Cart retrieved successfully", data: user.cart });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while fetching the cart' });
//   }
// };

// const buyItemsInCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const user = await userDb.findById(userId).populate('cart', 'price');
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }
//     const totalAmount = user.cart.reduce((acc, course) => acc + course.price, 0);

//     for (const course of user.cart) {
//       course.courseStatus = 'purchased';
//       await course.save();
//     }
//     user.walletAmount -= totalAmount;
//     await user.save();
//     user.cart = [];
//     await user.save();

//     res.status(200).json({ status: 200, message: "Items in the cart have been purchased successfully", totalAmount });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while processing the purchase' });
//   }
// };


// module.exports = {
//   addToCart,
//   deleteCourseFromCart,
//   getCart,
//   buyItemsInCart,
// };



//


const userDb = require('../model/userModel');
const courseDb = require('../model/courseModel');
const cartDb = require('../model/cartModel');

// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { courseId } = req.body;
//     const user = await userDb.findById(userId);
//     if (!user) {
//       return res.status(404).json({ status: 404, message: "User not found" });
//     }
//     const course = await courseDb.findById(courseId);
//     if (!course) {
//       return res.status(404).json({ status: 404, message: "Course not found" });
//     }
   
//     if (user.cart.includes(courseId)) {
//       return res.status(400).json({ status: 400, message: "Course is already in the cart" });
//     }
//     const cart = await cartDb.findOne({ userId });
//     if (!cart) {
//       const newCart = new cartDb({ userId, courses: [courseId] });
//       await newCart.save();
//     } else {
//       cart.courses.push(courseId);
//       await cart.save();
//     }

//     res.status(200).json({ status: 200, message: "Course added to cart successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while adding the course to the cart' });
//   }
// };

//
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { courseId } = req.body;

    const user = await userDb.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }

    const course = await courseDb.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 404, message: "Course not found" });
    }

    if (user.cart.includes(courseId)) {
      return res.status(400).json({ status: 400, message: "Course is already in the cart" });
    }

    const cart = await cartDb.findOne({ userId });

    if (!cart) {
      const newCart = new cartDb({ userId, courses: [courseId], totalAmount: course.price });
      await newCart.save();
    } else {
      cart.courses.push(courseId);
      cart.totalAmount += course.price;
      await cart.save();
    }

    res.status(200).json({ status: 200, message: "Course added to cart successfully", data: cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while adding the course to the cart' });
  }
};


const deleteCourseFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const courseId = req.params.courseId;

    const user = await userDb.findById(userId);
    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found" });
    }
    const course = await courseDb.findById(courseId);
    if (!course) {
      return res.status(404).json({ status: 404, message: "Course not found" });
    }
    const cart = await cartDb.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ status: 404, message: "Cart not found" });
    }
    if (!cart.courses.includes(courseId)) {
      return res.status(400).json({ status: 400, message: "Course is not in the cart" });
    }
    cart.courses = cart.courses.filter((course) => course.toString() !== courseId);
    cart.totalAmount = 0
    await cart.save();

    res.status(200).json({ status: 200, message: "Course removed from the cart successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while removing the course from the cart' });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartDb.findOne({ userId }).populate('courses', 'title description price');
    if (!cart) {
      return res.status(404).json({ status: 404, message: "Cart not found" });
    }

    res.status(200).json({ status: 200, message: "Cart retrieved successfully", data: cart.courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching the cart' });
  }
};

const buyItemsInCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartDb.findOne({ userId }).populate('courses', 'price');
    if (!cart) {
      return res.status(404).json({ status: 404, message: "Cart not found" });
    }

    const totalAmount = cart.courses.reduce((acc, course) => acc + course.price, 0);

    // Assuming you have implemented the buy logic here
    // For example, updating course status, deducting the amount from the user's wallet, etc.

    // After successful purchase, you can clear the courses array in the cart
    cart.courses = [];
    cart.totalAmount = 0
    await cart.save();

    res.status(200).json({ status: 200, message: "Items in the cart have been purchased successfully", totalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing the purchase' });
  }
};

module.exports = {
  addToCart,
  deleteCourseFromCart,
  getCart,
  buyItemsInCart,
};
