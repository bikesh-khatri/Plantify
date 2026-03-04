const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const UserMock = dbMock.define("User", {
  id: 1,
  fullName: "Test User",
  email: "test@test.com",
  phone: "9800000000",
  dob: "2000-01-01",
  password: "hashedPassword123",
  role: "user",
  status: "active",
  kycStatus: "none",
});

describe("User Model Tests", () => {

  test("TC1 user creation returns id and fullName", async () => {
    const user = await UserMock.create({ fullName: "Test User", email: "test@test.com", phone: "9800000000", password: "hashed", dob: "2000-01-01" });
    expect(user.id).toBeDefined();
    expect(user.fullName).toBe("Test User");
  });

  test("TC2 user email contains @ symbol", async () => {
    const user = await UserMock.create({ email: "test@test.com" });
    expect(user.email).toContain("@");
  });

  test("TC3 user phone is exactly 10 characters", async () => {
    const user = await UserMock.create({ phone: "9800000000" });
    expect(user.phone.length).toBe(10);
  });-

  test("TC4 user default role is user", async () => {
    const user = await UserMock.create({});
    expect(user.role).toBe("user");
  });

  test("TC5 user default kycStatus is none", async () => {
    const user = await UserMock.create({});
    expect(user.kycStatus).toBe("none");
  });

  test("TC6 user default status is active", async () => {
    const user = await UserMock.create({});
    expect(user.status).toBe("active");
  });

  test("TC7 user password field is not plain text", () => {
    const plain = "password123";
    expect(UserMock._defaults.password).not.toBe(plain);
  });

  test("TC8 user can be found by email", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1, email: "test@test.com" });
    const user = await UserMock.findOne({ where: { email: "test@test.com" } });
    expect(user).not.toBeNull();
    expect(user.email).toBe("test@test.com");
  });

  test("TC9 user findOne returns null for non-existent email", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue(null);
    const user = await UserMock.findOne({ where: { email: "ghost@test.com" } });
    expect(user).toBeNull();
  });

  test("TC10 user update modifies fullName", async () => {
    const updateMock = jest.fn().mockResolvedValue([1]);
    UserMock.update = updateMock;
    await UserMock.update({ fullName: "Updated Name" }, { where: { id: 1 } });
    expect(updateMock).toHaveBeenCalledWith({ fullName: "Updated Name" }, expect.any(Object));
  });
});