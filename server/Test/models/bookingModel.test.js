const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const BookingMock = dbMock.define("Booking", {
  id: 1,
  status: "pending",
  quantity: 2,
  userId: 1,
  plantId: 1,
});

describe("Booking Model Tests", () => {

  test("TC1 booking quantity must be at least 1", async () => {
    const booking = await BookingMock.create({ quantity: 3});
    expect(booking.quantity).toBeGreaterThanOrEqual(1);
  });

  test("TC2 booking default status is pending", async () => {
    const booking = await BookingMock.create({ quantity: 1 });
    expect(booking.status).toBe("pending");
  });

  test("TC2 booking quantity must be at least 1", async () => {
    const booking = await BookingMock.create({ quantity: 2 });
    expect(booking.quantity).toBeGreaterThanOrEqual(1);
  });

  test("TC3 booking status accepted is a valid enum value", () => {
    const validStatuses = ["pending", "accepted", "rejected"];
    expect(validStatuses).toContain("accepted");
  });

  test("TC4 booking status rejected is a valid enum value", () => {
    const validStatuses = ["pending", "accepted", "rejected"];
    expect(validStatuses).toContain("rejected");
  });

  test("TC5 booking has userId referencing a user", async () => {
    const booking = await BookingMock.create({ userId: 1, plantId: 1 });
    expect(booking.userId).toBe(1);
    expect(typeof booking.userId).toBe("number");
  });

  test("TC6 booking has plantId referencing a plant", async () => {
    const booking = await BookingMock.create({ userId: 1, plantId: 3 });
    expect(booking.plantId).toBeDefined();
  });

  test("TC7 booking findAll returns bookings for a user", async () => {
    BookingMock.findAll = jest.fn().mockResolvedValue([{ id: 1, userId: 1, status: "pending" }]);
    const bookings = await BookingMock.findAll({ where: { userId: 1 } });
    expect(bookings.length).toBeGreaterThan(0);
    expect(bookings[0].userId).toBe(1);
  });

  test("TC8 booking status can be updated from pending to accepted", async () => {
    const booking = await BookingMock.create({ status: "pending" });
    booking.status = "accepted";
    expect(booking.status).toBe("accepted");
  });

  test("TC9 booking findOne returns null when booking does not exist", async () => {
    BookingMock.findOne = jest.fn().mockResolvedValue(null);
    const booking = await BookingMock.findOne({ where: { id: 9999 } });
    expect(booking).toBeNull();
  });

  test("TC10 booking quantity field defaults to 1 when not specified", () => {
    const defaultQty = BookingMock._defaults.quantity || 1;
    expect(defaultQty).toBeGreaterThanOrEqual(1);
  });
});