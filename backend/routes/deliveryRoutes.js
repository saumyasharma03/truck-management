const express = require('express');
const router = express.Router();
const Delivery = require('../models/delivery');
const Truck = require('../models/truck');

// Get all deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await Delivery.find().populate('truck_id');
    res.json(deliveries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get delivery by delivery_id
router.get('/:delivery_id', async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ pin : req.params.delivery_id }).populate('truck_id');
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new delivery
router.post('/', async (req, res) => {
  const delivery = new Delivery(req.body);
  try {
    const truck = await Truck.findById(delivery.truck_id);
    if (!truck) return res.status(404).json({ message: 'Truck not found' });
    if (truck.status !== 'available') return res.status(400).json({ message: 'Truck not available' });

    const newDelivery = await delivery.save();
    truck.status = 'in transit';
    await truck.save();
    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a delivery
router.put('/:delivery_id', async (req, res) => {
  try {
    const updatedDelivery = await Delivery.findOneAndUpdate(
      { pin : req.params.delivery_id },
      req.body,
      { new: true }
    );
    if (!updatedDelivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(updatedDelivery);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a delivery
router.delete('/:delivery_id', async (req, res) => {
  try {
    const delivery = await Delivery.findOneAndDelete({ pin : req.params.delivery_id });
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });

    const truck = await Truck.findById(delivery.truck_id);
    if (truck) {
      truck.status = 'available';
      await truck.save();
    }
    res.json({ message: 'Delivery deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
