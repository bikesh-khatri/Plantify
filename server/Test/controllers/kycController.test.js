const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

// ── Mock Models ──────────────────────────────────────────────────────────────
const KycMock = dbMock.define("Kyc", {
  id: 1,
  userId: 1,
  nurseryName: "Green Nursery",
  phone: "9800000000",
  email: "nursery@test.com",
  dob: "2010-01-01",
  lat: 27.7,
  lng: 85.3,
  addressName: "Kathmandu",
  documentImage: "uploads/kyc/1/doc.jpg",
  image: "uploads/kyc/1/logo.jpg",
  status: "pending",
});

const UserMock = dbMock.define("User", {
  id: 1,
  fullName: "Owner",
  email: "owner@test.com",
  kycStatus: "none",
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Inline controller (mirrors kycController.js logic) ───────────────────────
const submitKyc = async (req, res) => {
  const logoFile = req.files?.image?.[0];
  const docFile = req.files?.documentImage?.[0];
  try {
    const { nurseryName, phone, email, dob, lat, lng } = req.body;
    if (!nurseryName || nurseryName.length < 3) return res.status(400).json({ message: "Nursery name must be at least 3 characters" });
    if (!phone || phone.length < 10) return res.status(400).json({ message: "Phone number must be at least 10 digits" });
    if (!email || !email.includes("@")) return res.status(400).json({ message: "Invalid email address" });
    if (!dob) return res.status(400).json({ message: "Established date is required" });
    if (isNaN(Number(lat)) || isNaN(Number(lng))) return res.status(400).json({ message: "Invalid latitude or longitude" });
    if (!logoFile || !docFile) return res.status(400).json({ message: "Both logo and registration document are required" });
    const userId = req.user.id;
    const [kyc, created] = await KycMock.findOrCreate({ where: { userId }, defaults: { nurseryName, phone, email, dob, lat: Number(lat), lng: Number(lng), userId, image: logoFile.path, documentImage: docFile.path, status: "pending" } });
    if (!created) await kyc.update({ nurseryName, phone, email, dob, lat: Number(lat), lng: Number(lng), image: logoFile.path, documentImage: docFile.path, status: "pending" });
    await UserMock.update({ kycStatus: "pending" }, { where: { id: userId } });
    return res.status(201).json({ message: "KYC submitted successfully", status: "pending" });
  } catch (error) {
    return res.status(500).json({ message: "Server error during KYC submission" });
  }
};

const getKycStatus = async (req, res) => {
  try {
    const kyc = await KycMock.findOne({ where: { userId: req.user.id } });
    if (!kyc) return res.json({ status: "none" });
    return res.json({ status: kyc.status, kyc });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching status" });
  }
};

const updateLogo = async (req, res) => {
  const logoFile = req.file;
  try {
    if (!logoFile) return res.status(400).json({ message: "No image provided" });
    const kyc = await KycMock.findOne({ where: { userId: req.user.id } });
    if (!kyc) return res.status(404).json({ message: "KYC not found" });
    await kyc.update({ image: logoFile.path });
    return res.json({ image: logoFile.path });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update logo" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
describe("KYC Controller Tests", () => {

  // ── TC56–TC65: submitKyc ─────────────────────────────────────────────────
  test("TC56 KYC submission succeeds with all valid data and files", async () => {
    KycMock.findOrCreate = jest.fn().mockResolvedValue([{ id: 1, update: jest.fn() }, true]);
    UserMock.update = jest.fn().mockResolvedValue([1]);
    const req = {
      body: { nurseryName: "Green Nursery", phone: "9800000000", email: "nursery@test.com", dob: "2010-01-01", lat: "27.7", lng: "85.3", addressName: "Kathmandu" },
      files: { image: [{ path: "uploads/kyc/1/logo.jpg" }], documentImage: [{ path: "uploads/kyc/1/doc.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "KYC submitted successfully" }));
  });

  test("TC57 KYC fails when nursery name is too short", async () => {
    const req = {
      body: { nurseryName: "AB", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Nursery name must be at least 3 characters" }));
  });

  test("TC58 KYC fails when phone number is less than 10 digits", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "98000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Phone number must be at least 10 digits" }));
  });

  test("TC59 KYC fails with invalid email format", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "9800000000", email: "invalidemail", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Invalid email address" }));
  });

  test("TC60 KYC fails when dob is missing", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "9800000000", email: "n@t.com", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Established date is required" }));
  });

  test("TC61 KYC fails when latitude is not a number", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "abc", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC62 KYC fails when document image file is missing", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Both logo and registration document are required" }));
  });

  test("TC63 KYC fails when logo file is missing", async () => {
    const req = {
      body: { nurseryName: "Nursery One", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("TC64 resubmit KYC updates existing record", async () => {
    const updateMock = jest.fn();
    KycMock.findOrCreate = jest.fn().mockResolvedValue([{ id: 1, update: updateMock }, false]);
    UserMock.update = jest.fn().mockResolvedValue([1]);
    const req = {
      body: { nurseryName: "New Nursery", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "new.jpg" }], documentImage: [{ path: "newdoc.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(updateMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("TC65 KYC submission sets user kycStatus to pending", async () => {
    KycMock.findOrCreate = jest.fn().mockResolvedValue([{ id: 1, update: jest.fn() }, true]);
    const updateUserMock = jest.fn().mockResolvedValue([1]);
    UserMock.update = updateUserMock;
    const req = {
      body: { nurseryName: "Test Nursery", phone: "9800000000", email: "n@t.com", dob: "2010-01-01", lat: "27.7", lng: "85.3" },
      files: { image: [{ path: "x.jpg" }], documentImage: [{ path: "y.jpg" }] },
      user: { id: 1 },
    };
    const res = mockRes();
    await submitKyc(req, res);
    expect(updateUserMock).toHaveBeenCalledWith({ kycStatus: "pending" }, expect.any(Object));
  });

  // ── TC66–TC70: getKycStatus & updateLogo ────────────────────────────────
  test("TC66 getKycStatus returns status and kyc data when KYC exists", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ status: "pending", nurseryName: "Green Nursery" });
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getKycStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ status: "pending" }));
  });

  test("TC67 getKycStatus returns none when no KYC record found", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { user: { id: 99 } };
    const res = mockRes();
    await getKycStatus(req, res);
    expect(res.json).toHaveBeenCalledWith({ status: "none" });
  });

  test("TC68 updateLogo succeeds when file provided and KYC exists", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ id: 1, image: "old.jpg", update: jest.fn() });
    const req = { file: { path: "new_logo.jpg" }, user: { id: 1 } };
    const res = mockRes();
    await updateLogo(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ image: "new_logo.jpg" }));
  });

  test("TC69 updateLogo fails when no file is provided", async () => {
    const req = { file: null, user: { id: 1 } };
    const res = mockRes();
    await updateLogo(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "No image provided" }));
  });

  test("TC70 updateLogo fails when KYC record does not exist", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { file: { path: "logo.jpg" }, user: { id: 1 } };
    const res = mockRes();
    await updateLogo(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "KYC not found" }));
  });
});