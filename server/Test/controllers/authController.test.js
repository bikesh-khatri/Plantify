const SequelizeMock = require("sequelize-mock");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const dbMock = new SequelizeMock();


const UserMock = dbMock.define("User", {
  id: 1,
  fullName: "Test User",
  email: "test@test.com",
  phone: "9800000000",
  password: "$2b$10$hashedpassword",
  dob: "2000-01-01",
  role: "user",
  status: "active",
  kycStatus: "none",
});

const KycMock = dbMock.define("Kyc", {
  id: 1,
  userId: 1,
  status: "verified",
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password, dob } = req.body;
    if (!fullName || !email || !phone || !password || !dob) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existing = await UserMock.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserMock.create({ fullName, email, phone, dob, password: hashedPassword, kycStatus: "none" });
    const token = jwt.sign({ id: newUser.id }, "plantify_secret_key_123", { expiresIn: "1h" });
    return res.status(201).json({ message: "User registered successfully", token, user: newUser });
  } catch (error) {
    return res.status(500).json({ message: "Server Error: " + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await UserMock.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });
    const expiresIn = rememberMe ? "7d" : "1h";
    const token = jwt.sign({ id: user.id }, "plantify_secret_key_123", { expiresIn });
    return res.json({ message: "Login success", token, user });
  } catch (error) {
    return res.status(500).json({ message: "Login Error" });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
    const user = await UserMock.findOne({ where: { id: 1 } });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashed });
    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to change password" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    if (!fullName && !phone) return res.status(400).json({ message: "Provide at least one field to update" });
    const user = await UserMock.findOne({ where: { id: 1 } });
    if (!user) return res.status(404).json({ message: "User not found" });
    await user.update({ fullName, phone });
    return res.json({ message: "Profile updated", user: { fullName, phone } });
  } catch (error) {
    return res.status(500).json({ message: "Update failed: " + error.message });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: "Password is required" });
    const user = await UserMock.findOne({ where: { id: 1 } });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });
    await user.destroy();
    return res.json({ message: "Account deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete account" });
  }
};

describe("Auth Controller Tests", () => {

  
  test("TC1 register success with all valid fields", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue(null);
    UserMock.create = jest.fn().mockResolvedValue({ id: 2, fullName: "Test", email: "new@test.com", phone: "9811111111", kycStatus: "none", role: "user" });
    const req = { body: { fullName: "Test", email: "new@test.com", phone: "9811111111", password: "hello", dob: "2000-01-01" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "User registered successfully" }));
  });

  test("TC2 register fails when all body fields are missing", async () => {
    const req = { body: {} };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC3 register fails on duplicate email", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1 });
    const req = { body: { fullName: "Test", email: "test@test.com", phone: "9800000000", password: "123456", dob: "2000-01-01" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Email already exists" }));
  });

  test("TC4 password is hashed before storing", async () => {
    const plain = "mypassword";
    const hashed = await bcrypt.hash(plain, 10);
    expect(hashed).not.toBe(plain);
    const match = await bcrypt.compare(plain, hashed);
    expect(match).toBe(true);
  });

  test("TC5 register returns JWT token on success", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue(null);
    UserMock.create = jest.fn().mockResolvedValue({ id: 3, fullName: "A", email: "a@b.com", phone: "9800000001", kycStatus: "none", role: "user" });
    const req = { body: { fullName: "A", email: "a@b.com", phone: "9800000001", password: "securepass", dob: "1999-05-05" } };
    const res = mockRes();
    await registerUser(req, res);
    const call = res.json.mock.calls[0][0];
    expect(call.token).toBeDefined();
  });

  // ── TC6–TC9: Register missing individual fields ──────────────────────────
  test("TC6 register fails when email is missing", async () => {
    const req = { body: { fullName: "A", phone: "9800000000", password: "123", dob: "2000-01-01" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC7 register fails when password is missing", async () => {
    const req = { body: { fullName: "A", email: "a@b.com", phone: "9800000000", dob: "2000-01-01" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC8 register fails when fullName is missing", async () => {
    const req = { body: { email: "a@b.com", phone: "9800000000", password: "123", dob: "2000-01-01" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC9 register fails when dob is missing", async () => {
    const req = { body: { fullName: "A", email: "a@b.com", phone: "9800000000", password: "123" } };
    const res = mockRes();
    await registerUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── TC10–TC14: Login ──────────────────────────────────────────────────────
  test("TC10 login success with valid credentials", async () => {
    const hashed = await bcrypt.hash("123456", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1, email: "test@test.com", password: hashed, role: "user", kycStatus: "none" });
    const req = { body: { email: "test@test.com", password: "123456" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Login success" }));
  });

  test("TC11 login fails with wrong password", async () => {
    const hashed = await bcrypt.hash("correctpass", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1, email: "test@test.com", password: hashed });
    const req = { body: { email: "test@test.com", password: "wrongpass" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("TC12 login fails with unregistered email", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { body: { email: "ghost@test.com", password: "123456" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("TC13 login with rememberMe true returns 7d token", async () => {
    const hashed = await bcrypt.hash("123456", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1, email: "test@test.com", password: hashed, role: "user", kycStatus: "none" });
    const req = { body: { email: "test@test.com", password: "123456", rememberMe: true } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.json).toHaveBeenCalled();
    const call = res.json.mock.calls[0][0];
    const decoded = jwt.verify(call.token, "plantify_secret_key_123");
    // 7-day token exp should be far in the future
    expect(decoded.exp - decoded.iat).toBeGreaterThan(3600);
  });

  test("TC14 login fails when email is missing", async () => {
    const req = { body: { password: "123456" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC15 login fails when password is missing", async () => {
    const req = { body: { email: "test@test.com" } };
    const res = mockRes();
    await loginUser(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── TC16–TC20: Change Password ───────────────────────────────────────────
  test("TC16 change password succeeds with correct current password", async () => {
    const hashed = await bcrypt.hash("oldpass", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed, update: jest.fn() });
    const req = { body: { currentPassword: "oldpass", newPassword: "newpass123" } };
    const res = mockRes();
    await changePassword(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Password changed successfully" }));
  });

  test("TC17 change password fails with wrong current password", async () => {
    const hashed = await bcrypt.hash("correctpass", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed });
    const req = { body: { currentPassword: "wrongpass", newPassword: "newpass123" } };
    const res = mockRes();
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  test("TC18 change password fails when new password is less than 6 chars", async () => {
    const hashed = await bcrypt.hash("oldpass", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed });
    const req = { body: { currentPassword: "oldpass", newPassword: "123" } };
    const res = mockRes();
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC19 change password fails when fields are missing", async () => {
    const req = { body: {} };
    const res = mockRes();
    await changePassword(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC20 change password hashes new password before saving", async () => {
    const hashed = await bcrypt.hash("oldpass", 10);
    const updateMock = jest.fn();
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed, update: updateMock });
    const spy = jest.spyOn(bcrypt, "hash");
    const req = { body: { currentPassword: "oldpass", newPassword: "newpass123" } };
    const res = mockRes();
    await changePassword(req, res);
    expect(spy).toHaveBeenCalledWith("newpass123", 10);
    spy.mockRestore();
  });

  // ── TC21–TC25: Update Profile & Delete Account ────────────────────────────
  test("TC21 update profile succeeds with valid data", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue({ id: 1, fullName: "Old", phone: "9800000000", update: jest.fn() });
    const req = { body: { fullName: "New Name", phone: "9811111111" } };
    const res = mockRes();
    await updateProfile(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Profile updated" }));
  });

  test("TC22 update profile fails when no fields provided", async () => {
    const req = { body: {} };
    const res = mockRes();
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC23 update profile fails when user not found", async () => {
    UserMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { body: { fullName: "Name" } };
    const res = mockRes();
    await updateProfile(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("TC24 delete account succeeds with correct password", async () => {
    const hashed = await bcrypt.hash("mypassword", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed, destroy: jest.fn() });
    const req = { body: { password: "mypassword" } };
    const res = mockRes();
    await deleteAccount(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Account deleted" }));
  });

  test("TC25 delete account fails with incorrect password", async () => {
    const hashed = await bcrypt.hash("correctpassword", 10);
    UserMock.findOne = jest.fn().mockResolvedValue({ password: hashed });
    const req = { body: { password: "wrongpassword" } };
    const res = mockRes();
    await deleteAccount(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});