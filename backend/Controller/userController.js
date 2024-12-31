import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Model/UserModel.js';
import Address from '../Model/AddressModel.js';
// Secret key for JWT (you should store this in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

// Register User Controller
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash the user's password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save user to database
    await newUser.save();

    // Generate JWT token for the user
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Send response with token and user data (excluding password)
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error);
    res.status(500).json({ message: 'Server error, try again later' });
  }
};

// Login User Controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token for the user
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Send success response with user data (excluding password)
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error, try again later' });
  }
};

// Save User Location Controller
export const saveLocation = async (req, res) => {
    const { selectedAddress } = req.body;
  
    // Validate that the address is provided
    if (!selectedAddress) {
      return res.status(400).json({ message: 'Location address is required' });
    }
  
    try {
      const user = await User.findById(req.user.userId); // Assuming user is authenticated
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Add the new address to the user's location array
      user.location.push(selectedAddress);
  
      // Save the updated user with the new location
      await user.save();
  
      res.status(200).json({
        message: 'Location saved successfully',
        locations: user.location,  // Return the updated locations array
      });
    } catch (error) {
      console.error('Error saving location:', error);
      res.status(500).json({ message: 'Server error, try again later' });
    }
  };
  // UserController.js


export const getUser = async (req, res) => {
  try {
    // Get user ID from the URL parameters (e.g., /user/:id)
    const userId = req.params.id;

    // Find the user in the database by ID and populate the addresses field
    const user = await User.findById(req.user.userId).populate('addresses');  // Populate the addresses field with address details

    // If the user is not found, send an error message
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If the user is found, send the user data along with populated addresses as the response
    return res.status(200).json(user);

  } catch (error) {
    // Handle any errors (e.g., invalid ID format or database issues)
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

  
  
export const authMiddleware = (req, res, next) => {
    // Check if the token is provided in the Authorization header (Bearer <token>)
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // "Bearer <token>"
  
    // If token is not found in the Authorization header, return 401 Unauthorized
    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }
  
    try {
      // Verify the token using JWT secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
      req.user = decoded; // Attach decoded user info to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired.' });
      }
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
  };
  
  export const addAddress = async (req, res) => {
    const { userId } = req.params; // Assuming `userId` is passed in the route params
    const { label, street, city, state, postalCode, country } = req.body;
  
    if (!label || !street || !city || !state || !postalCode || !country) {
      return res.status(400).json({ message: 'All fields are required' });
    }
  
    try {
      // Create a new address
      const newAddress = new Address({
        label,
        street,
        city,
        state,
        postalCode,
        country,
      });
  
      // Save the new address
      await newAddress.save();
  
      // Find the user by `userId` and add the new address to the `addresses` array
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Add the address reference to the user's `addresses` array
      user.addresses.push(newAddress._id);
      await user.save();
  
      res.status(200).json({
        message: 'Address added successfully',
        addresses: user.addresses,
      });
    } catch (error) {
      console.error('Error adding address:', error);
      res.status(500).json({ message: 'Server error, try again later' });
    }
  };