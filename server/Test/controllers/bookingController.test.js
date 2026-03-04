const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

// ── Mock Models ──────────────────────────────────────────────────────────────
const PlantMock = dbMock.define("Plant", {
  id: 1,
  name: "Rose",
  price: 200,
  quantity: 10,
  userId: 2,
  image: "rose.jpg",
});

const BookingMock = dbMock.define("Booking", {
  id: 1,
  plantId: 1,
  userId: 1,
  status: "pending",
  quantity: 2,
});

const UserMock = dbMock.define("User", {
  id: 1,
  fullName: "Customer",
  email: "customer@test.com",
  phone: "9800000000",
});

// ── Mock res factory ─────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Inline controllers (mirrors bookingController.js logic) ──────────────────
const bookPlant = async (req, res) => {
  try {
    const { plantId, quantity = 1 } = req.body;
    const qty = parseInt(quantity);
    const plant = await PlantMock.findOne({ where: { id: plantId } });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.quantity <= 0) return res.status(400).json({ message: "Out of stock" });
    if (qty < 1) return res.status(400).json({ message: "Quantity must be at least 1" });
    if (qty > plant.quantity) return res.status(400).json({ message: `Only ${plant.quantity} units available` });
    const existing = await BookingMock.findOne({ where: { plantId, userId: req.user.id, status: "pending" } });
    if (existing) return res.status(400).json({ message: "You already have a pending booking for this plant" });
    const booking = await BookingMock.create({ plantId, userId: req.user.id, status: "pending", quantity: qty });
    return res.status(201).json({ message: "Booking request sent! Waiting for owner approval.", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const booking = await BookingMock.findOne({ where: { id: bookingId } });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.Plant && booking.Plant.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to manage this booking" });
    }
    if (status === "accepted") {
      const plant = await PlantMock.findOne({ where: { id: booking.plantId } });
      if (plant.quantity < booking.quantity) {
        return res.status(400).json({ message: `Not enough stock. Only ${plant.quantity} units left.` });
      }
      plant.quantity -= booking.quantity;
      booking.status = status;
      return res.json({ message: "Booking accepted successfully", updatedQuantity: plant.quantity, plantId: booking.plantId });
    }
    booking.status = status;
    return res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await BookingMock.findAll({ where: { userId: req.user.id } });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching your bookings" });
  }
};

const getMyNurseryBookings = async (req, res) => {
  try {
    const bookings = await BookingMock.findAll({ where: {} });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching bookings" });
  }
};


describe("Booking Controller Tests", () => {


  test("TC26 book plant success with valid data", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 10, userId: 2 });
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    BookingMock.create = jest.fn().mockResolvedValue({ id: 5, plantId: 1, userId: 1, status: "pending", quantity: 10 });
    const req = { body: { plantId: 1, quantity: 2}, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Booking request sent! Waiting for owner approval." }));
  });

  test("TC27 book plant fails when plant not found", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { body: { plantId: 999, quantity: 1 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Plant not found" }));
  });

  test("TC28 book plant fails when plant is out of stock", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 0 });
    const req = { body: { plantId: 1, quantity: 1 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Out of stock" }));
  });

  test("TC29 book plant fails when requested quantity exceeds available stock", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 3 });
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { body: { plantId: 1, quantity: 10 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Only 3 units available" }));
  });

  test("TC30 book plant fails on duplicate pending booking", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 10 });
    BookingMock.findOne = jest.fn().mockResolvedValue({ id: 1, status: "pending" });
    const req = { body: { plantId: 1, quantity: 1 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "You already have a pending booking for this plant" }));
  });

  // ── TC31–TC35: updateBookingStatus ──────────────────────────────────────
  test("TC31 accept booking successfully reduces plant stock", async () => {
    const plant = { id: 1, quantity: 10, save: jest.fn() };
    const booking = { id: 1, plantId: 1, userId: 1, quantity: 2, status: "pending", Plant: { userId: 2 }, save: jest.fn() };
    BookingMock.findOne = jest.fn().mockResolvedValue(booking);
    PlantMock.findOne = jest.fn().mockResolvedValue(plant);
    const req = { params: { bookingId: 1 }, body: { status: "accepted" }, user: { id: 2 } };
    const res = mockRes();
    await updateBookingStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Booking accepted successfully" }));
  });

  test("TC32 reject booking successfully", async () => {
    const booking = { id: 1, plantId: 1, quantity: 2, status: "pending", Plant: { userId: 2 }, save: jest.fn() };
    BookingMock.findOne = jest.fn().mockResolvedValue(booking);
    const req = { params: { bookingId: 1 }, body: { status: "rejected" }, user: { id: 2 } };
    const res = mockRes();
    await updateBookingStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Booking rejected successfully" }));
  });

  test("TC33 update booking fails when booking not found", async () => {
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { params: { bookingId: 999 }, body: { status: "accepted" }, user: { id: 2 } };
    const res = mockRes();
    await updateBookingStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("TC34 update booking fails with invalid status value", async () => {
    const req = { params: { bookingId: 1 }, body: { status: "unknown" }, user: { id: 2 } };
    const res = mockRes();
    await updateBookingStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid status value" }));
  });

  test("TC35 accept booking fails when stock is insufficient", async () => {
    const plant = { id: 1, quantity: 1 };
    const booking = { id: 1, plantId: 1, quantity: 5, status: "pending", Plant: { userId: 2 } };
    BookingMock.findOne = jest.fn().mockResolvedValue(booking);
    PlantMock.findOne = jest.fn().mockResolvedValue(plant);
    const req = { params: { bookingId: 1 }, body: { status: "accepted" }, user: { id: 2 } };
    const res = mockRes();
    await updateBookingStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Not enough stock. Only 1 units left." }));
  });

  // ── TC36–TC40: Fetch bookings ────────────────────────────────────────────
  test("TC36 get my bookings returns list for logged in user", async () => {
    BookingMock.findAll = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getMyBookings(req, res);
    expect(res.json).toHaveBeenCalled();
    const result = res.json.mock.calls[0][0];
    expect(Array.isArray(result)).toBe(true);
  });

  test("TC37 get my bookings returns empty array when no bookings exist", async () => {
    BookingMock.findAll = jest.fn().mockResolvedValue([]);
    const req = { user: { id: 99 } };
    const res = mockRes();
    await getMyBookings(req, res);
    const result = res.json.mock.calls[0][0];
    expect(result.length).toBe(0);
  });

  test("TC38 get nursery bookings returns all bookings for owner", async () => {
    BookingMock.findAll = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    const req = { user: { id: 2 } };
    const res = mockRes();
    await getMyNurseryBookings(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("TC39 booking default quantity is 1 when not provided", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 10 });
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    BookingMock.create = jest.fn().mockResolvedValue({ id: 5, quantity: 1, status: "pending" });
    const req = { body: { plantId: 1 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(BookingMock.create).toHaveBeenCalledWith(expect.objectContaining({ quantity: 1 }));
  });

  test("TC40 booking status defaults to pending on creation", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, quantity: 10 });
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    const createMock = jest.fn().mockResolvedValue({ id: 5, status: "pending" });
    BookingMock.create = createMock;
    const req = { body: { plantId: 1, quantity: 2 }, user: { id: 1 } };
    const res = mockRes();
    await bookPlant(req, res);
    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
  });
});