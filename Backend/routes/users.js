const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const mongoose = require('mongoose');
const upload = require('../config/multer');
const cloudinary = require('../config/configCloudinary');
const { UserArchive } = require('../models/ArchiveUser');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.memoryStorage();
const uploadOptions = multer({ storage: storage });

// Function to update the user's online status
async function updateOnlineStatus(userId, status) {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        user.isOnline = status;
        await user.save();
        console.log(`User ${userId} is now ${status ? 'online' : 'offline'}`);
    } catch (error) {
        console.error('Error updating online status:', error);
    }
}

// Get all users
router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    if (!userList) {
        return res.status(500).json({ success: false });
    }
    res.send(userList);
});

router.get('/archive', async (req, res) => {
    try {
        const userList = await UserArchive.find().select('-passwordHash');
        if (!userList) {
            return res.status(500).json({ success: false, message: 'Error fetching users' });
        }
        res.status(200).json(userList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
});
// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findById(userId).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Internal server error', error: error.message || error });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.secret;

    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
                pushToken: user.pushToken
            },
            secret,
            { expiresIn: '1d' }
        );

        console.log("User:", user); // Log the user
        console.log("Secret:", secret); // Log the secret
        console.log("Token:", token); // Log the token

        // Update online status when user logs in
        await updateOnlineStatus(user.id, true);

        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).send('Password is incorrect!');
    }
});

// Logout route
router.post('/logout', async (req, res) => {
    const { userId } = req.body;  // Assuming you send the userId with the logout request

    console.log('Logging out user with ID:', userId);  // Log userId to check

    try {
        // Update online status to false when user logs out
        await updateOnlineStatus(userId, false);

        res.status(200).send({ message: 'User logged out and online status updated' });
    } catch (error) {
        console.error('Error updating online status:', error); // Log error if it occurs
        res.status(500).send('Error updating online status');
    }
});

// Register route
router.post('/register', upload.single('image'), async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            passwordHash: bcrypt.hashSync(req.body.password, 10),
            phone: req.body.phone,
            isAdmin: req.body.isAdmin === 'true',
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
            image: req.file.path, // Image path from Cloudinary
        });

        await user.save();
        res.status(201).json({ message: 'User registered successfully!', user });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


router.put('/:id', upload.single('image'), async (req, res) => {
    try {

        const userExist = await User.findById(req.params.id);
        if (!userExist) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const newPassword = req.body.password ? bcrypt.hashSync(req.body.password, 10) : userExist.passwordHash;

        const updateData = {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        };

        // Handle image upload
        if (req.file) {
            console.log('Image file received:', req.file); // Debugging line
            // The CloudinaryStorage already handles uploading; you just need to save the URL
            const uploadedImageUrl = req.file.path; // This should be the URL from Cloudinary
            console.log('Uploaded image URL:', uploadedImageUrl); // Verify this output
            updateData.image = uploadedImageUrl; // Store the image URL from Cloudinary
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!updatedUser) {
            return res.status(400).json({ success: false, message: 'User update failed' });
        }

        return res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// router.post('/googlelogin', async (req, res) => {
//     const { response } = req.body;
//     console.log(response);

//     try {
//         let user = await User.findOne({ googleId: response.id });

//         if (!user) {
//             user = await User.create({
//                 name: response.name,
//                 email: response.email,
//                 password: '',
//                 avatar: {
//                     public_id: 'avatars/avatar-default',
//                     url: response.picture,
//                 },
//                 googleId: response.id
//             });
//         }

//         sendToken(user, 200, res);
//     } catch (error) {
//         console.error('Google login error:', error);
//         res.status(400).send('Google login failed');
//     }
// });

router.post('/archive', upload.single('image'), async (req, res, next) => {
    try {
        let imageUrl = req.body.image;

        if (req.file && req.file.path) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'gourdify',
                    width: 150,
                    crop: "scale"
                });
                imageUrl = result.secure_url;
            } catch (err) {
                return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: err.message });
            }
        }

        const { _id, ...rest } = req.body;

        const userFromDb = await User.findById(_id).select('+passwordHash');
        console.log('Fetched userFromDb:', userFromDb);

        if (!userFromDb) {
            return res.status(404).json({ success: false, message: 'User not found in main collection' });
        }

        const userarchive = new UserArchive({
            ...rest,
            passwordHash: userFromDb.passwordHash,
            image: imageUrl,
        });

        await userarchive.save();

        res.status(201).json({ success: true, message: "User archived successfully", userarchive });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all archived users


// Restore a user from archive
router.post('/archive/restore', upload.single('image'), async (req, res) => {
    try {
        let imageUrl = req.body.image;

        if (req.file && req.file.path) {
            try {
                const result = await cloudinary.v2.uploader.upload(req.file.path, {
                    folder: 'gourdify',
                    width: 150,
                    crop: "scale"
                });
                imageUrl = result.secure_url;
            } catch (err) {
                return res.status(500).json({ success: false, message: 'Cloudinary upload failed', error: err.message });
            }
        }

        const { _id, ...rest } = req.body;

        const userFromDb = await UserArchive.findById(_id).select('+passwordHash');
        console.log('Fetched userFromDb:', userFromDb);

        if (!userFromDb) {
            return res.status(404).json({ success: false, message: 'User not found in main collection' });
        }

        const userarchive = new User({
            ...rest,
            passwordHash: userFromDb.passwordHash,
            image: imageUrl,
        });

        await userarchive.save();

        res.status(201).json({ success: true, message: "User archived successfully", userarchive });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete an archived user
router.delete('/archive/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const userarchive = await UserArchive.findByIdAndDelete(userId);
        if (!userarchive) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
});


// Delete user route
router.delete('/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID format' });
        }

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
    }
});

// Route for changing user role
router.patch('/:id/role', async (req, res) => {
    try {
      const userId = req.params.id;
      const { isAdmin } = req.body;
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      // Update the role
      user.isAdmin = isAdmin;
      await user.save();
  
      res.status(200).json({ success: true, message: 'User role updated successfully', user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

// Helper function to send JWT token
function sendToken(user, statusCode, res) {
    const secret = process.env.secret;
    const token = jwt.sign(
        {
            userId: user.id,
            isAdmin: user.isAdmin
        },
        secret,
        { expiresIn: '1d' }
    );
    res.status(statusCode).send({ user: user.email, token });
}

router.put("/update-push-token/:id", async (req, res) => {
    try {
              const { expoPushToken } = req.body;
              if (!expoPushToken) {
                return res.status(400).json({ message: "Push token is required" });
              }
              console.log("Updating push token for user:", req.params.id);
              console.log("New push token:", expoPushToken);
              const user = await User.findByIdAndUpdate(
                req.params.id,
                { pushToken: expoPushToken },
                { new: true }
              );
              if (!user) {
                return res.status(404).json({ message: "User not found" });
              }
          
              res.status(200).json({
                message: "Push token updated successfully",
                pushToken: user.pushToken,
              });
    }
    catch (error) {}
})


module.exports = router;