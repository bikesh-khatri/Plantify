import Booking from "../models/Booking.js";
import Plant from "../models/Plant.js";
import User from "../models/User.js";

// Customer books a plant with quantity
export const bookPlant = async (req, res) => {
  try {
    const { plantId, quantity = 1 } = req.body;
    const qty = parseInt(quantity);

    const plant = await Plant.findByPk(plantId);
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.quantity <= 0) return res.status(400).json({ message: "Out of stock" });
    if (qty < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    if (qty > plant.quantity) return res.status(400).json({ message: `Only ${plant.quantity} units available` });

    // Prevent duplicate pending bookings
    const existing = await Booking.findOne({
      where: { plantId, userId: req.user.id, status: "pending" }
    });
    if (existing) return res.status(400).json({ message: "You already have a pending booking for this plant" });

    const booking = await Booking.create({
      plantId,
      userId: req.user.id,
      status: "pending",
      quantity: qty,
    });

    res.status(201).json({ message: "Booking request sent! Waiting for owner approval.", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Owner accepts or rejects - stock reduced immediately on accept
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Plant }]
    });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.Plant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to manage this booking" });
    }

    if (status === "accepted") {
      const plant = await Plant.findByPk(booking.plantId);
      if (plant.quantity < booking.quantity) {
        return res.status(400).json({ message: `Not enough stock. Only ${plant.quantity} units left.` });
      }
      // Immediately reduce stock
      plant.quantity -= booking.quantity;
      await plant.save();

      booking.status = status;
      await booking.save();

      // Return updated quantity for real-time frontend update
      return res.json({
        message: "Booking accepted successfully",
        updatedQuantity: plant.quantity,
        plantId: booking.plantId,
      });
    }

    booking.status = status;
    await booking.save();
    res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Owner sees all booking requests for their plants
export const getMyNurseryBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      include: [
        {
          model: Plant,
          where: { userId: req.user.id },
          attributes: ["id", "name", "quantity", "image", "price"]
        },
        {
          model: User,
          attributes: ["id", "fullName", "email", "phone"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings" });
  }
};

// Customer sees their own bookings
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Plant,
          attributes: ["id", "name", "image", "price"],
          include: [{ model: User, attributes: ["fullName"] }]
        }
      ],
      order: [["createdAt", "DESC"]]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching your bookings" });
  }
};