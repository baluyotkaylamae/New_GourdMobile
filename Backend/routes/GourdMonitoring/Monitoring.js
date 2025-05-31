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

async function checkHarvestNotifications() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find all monitorings where at least one harvest day is today and notificationStatus is false
        const monitorings = await Monitoring.find({
            "dateOfHarvest": {
                $elemMatch: {
                    date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
                    notificationStatus: false
                }
            }
        }).populate('userID').populate('gourdType');

        for (const monitoring of monitorings) {
            const dayIndex = monitoring.dateOfHarvest.findIndex(
                d => d.date && new Date(d.date).setHours(0, 0, 0, 0) === today.getTime() && !d.notificationStatus
            );
            if (dayIndex === -1) continue;

            const user = monitoring.userID;
            if (!user || !user.pushToken) continue;

            // Prepare message for each day
            let dayMessage = "";
            if (dayIndex === 0) {
                dayMessage = "Harvest starts today!\n7 days of harvesting ahead.";
            } else if (dayIndex === 6) {
                dayMessage = "Last day to harvest!";
            } else {
                dayMessage = `${7 - dayIndex} days left to complete harvest.`;
            }

            // Gather harvest info
            const expectedHarvest = Array.isArray(monitoring.pollinatedFlowerImages) ? monitoring.pollinatedFlowerImages.length : 0;
            const actualHarvest = Array.isArray(monitoring.fruitHarvestedImages) ? monitoring.fruitHarvestedImages.length : 0;
            const pollinationDate = monitoring.dateOfPollination
                ? new Date(monitoring.dateOfPollination).toLocaleDateString()
                : 'N/A';

            const message =
                `${dayMessage}\n` +
                `Date of Pollination: ${pollinationDate}\n` +
                `Gourd: ${monitoring.gourdType.name}\n` +
                `Plot: ${monitoring.plotNo || 'N/A'}\n` +
                `Expected Harvest: ${expectedHarvest}\n` +
                `Actual Harvest: ${actualHarvest}\n`;

            const data = {
                title: "HARVEST REMINDER",
                message,
                data: { monitoringId: monitoring._id },
            };

            // Send notification
            console.log(
                `Sending notification to user: ${user._id} (${user.email}), pushToken: ${user.pushToken}`
            );

            await pushNotification(data, user.pushToken);

            // Update notificationStatus for this day
            monitoring.dateOfHarvest[dayIndex].notificationStatus = true;
            await monitoring.save();
        }
    } catch (error) {
        console.error('Error checking harvest notifications:', error);
    }
}

// Schedule the function to run daily
cron.schedule("*/2 * * * *", () => {
    console.log('Running daily harvest notification check at 5:00 AM...');
    checkHarvestNotifications();
});

module.exports = router;