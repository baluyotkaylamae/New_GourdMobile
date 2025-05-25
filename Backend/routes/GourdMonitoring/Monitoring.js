const express = require('express');
const Monitoring = require('../../models/Monitoring'); // Adjust the path as needed
const cloudinary = require("cloudinary").v2;
const upload = require('../../config/multer');
const router = express.Router();
const { pushNotification } = require('../../utils/Notification');
const cron = require('node-cron');
const mongoose = require('mongoose'); // <-- Add this line

// Get all monitoring records
router.get('/', async (req, res) => {
    try {
        const monitorings = await Monitoring.find()
            .populate('userID', 'name email')
            .populate('gourdType', 'name description');
        res.status(200).json(monitorings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get a monitoring record by ID
router.get('/:userId', async (req, res) => {
    try {
        const monitorings = await Monitoring.find({ userID: req.params.userId })
            .populate('userID', 'name email')
            .populate('gourdType', 'name description');
        if (!monitorings) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }
        res.status(200).json(monitorings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new monitoring record
router.post('/', upload.fields([
    { name: "pollinatedFlowerImages", maxCount: 20 },
    { name: "fruitHarvestedImages", maxCount: 20 }
]), async (req, res) => {
    try {
        const {
            gourdType,
            dateOfPollination,
            dateOfHarvestStart,
            status,
            plotNo,
        } = req.body;

        if (!dateOfPollination || !dateOfHarvestStart) {
            return res.status(400).json({ message: 'dateOfPollination and dateOfHarvestStart are required' });
        }

        const parsedDateOfPollination = new Date(dateOfPollination);
        const start = new Date(dateOfHarvestStart);

        // Generate 7 days for dateOfHarvest
        const dateOfHarvest = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(start);
            day.setDate(start.getDate() + 7 + i); // Start 7 days after pollination
            dateOfHarvest.push({ date: day, notificationStatus: false });
        }

        // Handle pollinatedFlowerImages with unique IDs
        let pollinatedFlowerImages = [];
        if (req.body.pollinatedFlowerImages) {
            let imgs = req.body.pollinatedFlowerImages;
            if (!Array.isArray(imgs)) imgs = [imgs];
            imgs.forEach(imgStr => {
                try {
                    pollinatedFlowerImages.push(JSON.parse(imgStr));
                } catch (e) {
                    // fallback for new uploads (handled below)
                }
            });
        }
        // Add new uploaded files as objects (if any)
        if (req.files && req.files.pollinatedFlowerImages) {
            for (const file of req.files.pollinatedFlowerImages) {
                const result = await cloudinary.uploader.upload(file.path);
                pollinatedFlowerImages.push({
                    _id: new mongoose.Types.ObjectId(),
                    url: result.secure_url
                });
            }
        }
        // monitoring.pollinatedFlowerImages = pollinatedFlowerImages;
        // Handle fruitHarvestedImages with unique IDs
        let fruitHarvestedImages = [];
        if (req.files && req.files.fruitHarvestedImages) {
            for (const file of req.files.fruitHarvestedImages) {
                const result = await cloudinary.uploader.upload(file.path);
                fruitHarvestedImages.push({
                    _id: new mongoose.Types.ObjectId(),
                    url: result.secure_url
                });
            }
        }

        // Count totals based on images
        const pollinatedFlowers = pollinatedFlowerImages.length;
        const fruitsHarvested = fruitHarvestedImages.length;

        const newMonitoring = new Monitoring({
            userID: req.auth.userId,
            gourdType,
            dateOfPollination: parsedDateOfPollination,
            dateOfHarvest,
            pollinatedFlowerImages,
            fruitHarvestedImages,
            pollinatedFlowers,
            fruitsHarvested,
            status: status || 'In Progress',
            plotNo,
        });

        await newMonitoring.save();
        res.status(201).json({
            message: 'Monitoring record created successfully',
            monitoring: newMonitoring,
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Monitoring validation failed', errors: err.errors });
    }
});


// Update a monitoring record by ID
router.put('/:id', upload.fields([
    { name: "pollinatedFlowerImages", maxCount: 20 },
    { name: "fruitHarvestedImages", maxCount: 20 }
]), async (req, res) => {
    try {
        const monitoring = await Monitoring.findById(req.params.id);
        if (!monitoring) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }

        // Update allowed fields
        if (req.body.gourdType) monitoring.gourdType = req.body.gourdType;
        if (req.body.dateOfPollination) monitoring.dateOfPollination = req.body.dateOfPollination;
        if (req.body.plotNo) monitoring.plotNo = req.body.plotNo;
        if (req.body.status) monitoring.status = req.body.status;

        // Handle pollinatedFlowerImages
        if (
            (req.body.pollinatedFlowerImages && req.body.pollinatedFlowerImages.length > 0) ||
            (req.files && req.files.pollinatedFlowerImages && req.files.pollinatedFlowerImages.length > 0)
        ) {
            let pollinatedFlowerImages = [];
            if (req.body.pollinatedFlowerImages) {
                let imgs = req.body.pollinatedFlowerImages;
                if (!Array.isArray(imgs)) imgs = [imgs];
                imgs.forEach(imgStr => {
                    try {
                        pollinatedFlowerImages.push(JSON.parse(imgStr));
                    } catch (e) {
                        // fallback for new uploads (handled below)
                    }
                });
            }
            if (req.files && req.files.pollinatedFlowerImages) {
                for (const file of req.files.pollinatedFlowerImages) {
                    const result = await cloudinary.uploader.upload(file.path);
                    pollinatedFlowerImages.push({
                        _id: new mongoose.Types.ObjectId(),
                        url: result.secure_url
                    });
                }
            }
            monitoring.pollinatedFlowerImages = pollinatedFlowerImages;
        }

        // Handle fruitHarvestedImages (always update)
        let fruitHarvestedImages = [];
        if (req.body.fruitHarvestedImages) {
            let imgs = req.body.fruitHarvestedImages;
            if (!Array.isArray(imgs)) imgs = [imgs];
            imgs.forEach(imgStr => {
                try {
                    fruitHarvestedImages.push(JSON.parse(imgStr));
                } catch (e) {
                    // fallback for new uploads (handled below)
                }
            });
        }
        if (req.files && req.files.fruitHarvestedImages) {
            for (const file of req.files.fruitHarvestedImages) {
                const result = await cloudinary.uploader.upload(file.path);
                fruitHarvestedImages.push({
                    _id: new mongoose.Types.ObjectId(),
                    url: result.secure_url
                });
            }
        }

        monitoring.fruitHarvestedImages = fruitHarvestedImages;
        monitoring.fruitsHarvested = fruitHarvestedImages.length;

        if (monitoring.dateOfPollination) {
            const start = new Date(monitoring.dateOfPollination);
            let dateOfHarvest = [];
            for (let i = 0; i < 7; i++) {
                const day = new Date(start);
                day.setDate(start.getDate() + 7 + i);
                dateOfHarvest.push({ date: day, notificationStatus: false });
            }
            monitoring.dateOfHarvest = dateOfHarvest;
        }

        // Save the document
        await monitoring.save();
        res.status(200).json(monitoring);
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: err.message });
    }
});

// Delete a monitoring record by ID
router.delete('/:id', async (req, res) => {
    try {
        const monitoring = await Monitoring.findById(req.params.id);
        if (!monitoring) {
            return res.status(404).json({ message: 'Monitoring record not found' });
        }

        await Monitoring.deleteOne({ _id: req.params.id });
        res.status(200).json({ message: 'Monitoring record deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

async function checkFinalizationAndNotify() {
    try {
        const today = new Date(); // Get today's date
        const startOfDay = new Date(today.setHours(0, 0, 0, 0)); // Start of the day
        const endOfDay = new Date(today.setHours(23, 59, 59, 999)); // End of the day

        console.log('Querying monitorings with dateOfFinalization between:', startOfDay, 'and', endOfDay);

        const monitorings = await Monitoring.find({
            dateOfFinalization: { $gte: startOfDay, $lte: endOfDay },
        }).populate('userID').populate('gourdType');

        console.log('Raw monitorings:', monitorings);

        if (monitorings.length === 0) {
            console.log('No monitorings found for today.');
            return;
        }

        console.log(`Found ${monitorings.length} monitoring(s) with today's dateOfFinalization.`);

        for (const monitoring of monitorings) {
            const user = monitoring.userID;
            if (user && user.pushToken) {
                console.log(`Sending notification to user: ${user.name} (Push Token: ${user.pushToken})`);

                const data = {
                    title: "START YOUR HARVEST!",
                    message: `Gourd: ${monitoring.gourdType.name}\nPollinated: ${monitoring.pollinatedFlowers}\nHarvest: ${monitoring.fruitsHarvested || 0}\nPlot: ${monitoring.plotNo || 'N/A'}`,
                    data: { monitoringId: monitoring._id },
                };

                const result = await pushNotification(data, user.pushToken); // Send notification to the user's push token
                console.log(`Notification sent successfully for user: ${user.name}`, result);
            } else {
                console.log(`User ${user ? user.name : 'unknown'} does not have a valid push token.`);
            }
        }
    } catch (error) {
        console.error('Error checking finalization and notifying users:', error);
    }
}

// Schedule the function to run daily
cron.schedule('0 5 * * *', () => {
    console.log('Running daily finalization notification check at 5:00 AM...');
    checkFinalizationAndNotify();
});

module.exports = router;
