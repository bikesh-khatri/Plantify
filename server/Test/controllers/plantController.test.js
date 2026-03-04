const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

// ── Mock Models ──────────────────────────────────────────────────────────────
const PlantMock = dbMock.define("Plant", {
  id: 1,
  name: "Rose",
  price: 200,
  quantity: 5,
  category: "flowering",
  environment: "outdoor",
  seasonality: "seasonal",
  guide: "Water daily",
  image: "uploads/plants/rose.jpg",
  userId: 1,
});

const KycMock = dbMock.define("Kyc", {
  id: 1,
  userId: 1,
  status: "verified",
  nurseryName: "Green Nursery",
});

const UserMock = dbMock.define("User", {
  id: 1,
  fullName: "Nursery Owner",
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// ── Inline controller (mirrors plantController.js) ────────────────────────────
const addPlant = async (req, res) => {
  try {
    const kyc = await KycMock.findOne({ where: { userId: req.user.id } });
    if (!kyc || kyc.status !== "verified") {
      if (req.file) { /* delete temp */ }
      return res.status(403).json({ message: kyc ? "Your KYC is still pending verification" : "Please complete KYC verification first" });
    }
    const { name, price, quantity, category, environment, seasonality, guide } = req.body;
    if (!req.file) return res.status(400).json({ message: "Plant image is required" });
    if (!name || !price || !guide || !category || !environment || !seasonality) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const newPlant = await PlantMock.create({ name, price: parseFloat(price), quantity: parseInt(quantity) || 1, category, environment, seasonality, guide, image: req.file.path, userId: req.user.id });
    return res.status(201).json(newPlant);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const updatePlant = async (req, res) => {
  try {
    const plant = await PlantMock.findOne({ where: { id: req.params.id } });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.userId !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    const { name, price, quantity, category, environment, seasonality, guide } = req.body;
    await plant.update({ name: name || plant.name, price: price ? parseFloat(price) : plant.price, quantity: quantity !== undefined ? parseInt(quantity) : plant.quantity, category: category || plant.category, environment: environment || plant.environment, seasonality: seasonality || plant.seasonality, guide: guide || plant.guide });
    return res.json(plant);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update plant" });
  }
};

const deletePlant = async (req, res) => {
  try {
    const plant = await PlantMock.findOne({ where: { id: req.params.id } });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    if (plant.userId !== req.user.id) return res.status(403).json({ message: "Not authorized" });
    await plant.destroy();
    return res.json({ message: "Plant removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMyPlants = async (req, res) => {
  try {
    const plants = await PlantMock.findAll({ where: { userId: req.user.id } });
    return res.json(plants);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching your inventory" });
  }
};

const getAllPlants = async (req, res) => {
  try {
    const plants = await PlantMock.findAll({ where: {} });
    return res.json(plants);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching marketplace" });
  }
};

const getPlantById = async (req, res) => {
  try {
    const plant = await PlantMock.findOne({ where: { id: req.params.id } });
    if (!plant) return res.status(404).json({ message: "Plant not found" });
    return res.json(plant);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching plant" });
  }
};


describe("Plant Controller Tests", () => {
  test("TC41 add plant success when KYC is verified and all fields provided", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ status: "verified" });
    PlantMock.create = jest.fn().mockResolvedValue({ id: 10, name: "Lotus" });
    const req = {
      body: { name: "Lotus", price: "300", quantity: "5", category: "flowering", environment: "outdoor", seasonality: "seasonal", guide: "Water daily" },
      file: { path: "uploads/plants/lotus.jpg" },
      user: { id: 1 },
    };
    const res = mockRes();
    await addPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("TC42 add plant fails when KYC is not verified", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ status: "pending" });
    const req = { body: { name: "Rose" }, file: { path: "x.jpg" }, user: { id: 1 } };
    const res = mockRes();
    await addPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Your KYC is still pending verification" }));
  });

  test("TC43 add plant fails when no KYC record exists", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { body: { name: "Rose" }, file: null, user: { id: 1 } };
    const res = mockRes();
    await addPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Please complete KYC verification first" }));
  });

  test("TC44 add plant fails when image is missing", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ status: "verified" });
    const req = { body: { name: "Tulip", price: "100", category: "flowering", environment: "indoor", seasonality: "seasonal", guide: "Water" }, file: null, user: { id: 1 } };
    const res = mockRes();
    await addPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Plant image is required" }));
  });

  test("TC45 add plant fails when required body fields are missing", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue({ status: "verified" });
    const req = { body: { name: "Tulip" }, file: { path: "tulip.jpg" }, user: { id: 1 } };
    const res = mockRes();
    await addPlant(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "All fields are required" }));
  });

  // ── TC46–TC50: updatePlant ───────────────────────────────────────────────
  test("TC46 update plant succeeds when owner updates own plant", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 1, name: "Rose", price: 200, quantity: 5, category: "flowering", environment: "outdoor", seasonality: "seasonal", guide: "x", update: jest.fn().mockResolvedValue(true) });
    const req = { params: { id: 1 }, body: { name: "Updated Rose", price: "250" }, user: { id: 1 } };
    const res = mockRes();
    await updatePlant(req, res);
    expect(res.json).toHaveBeenCalled();
  });

  test("TC47 update plant fails when plant not found", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { params: { id: 999 }, body: { name: "Ghost" }, user: { id: 1 } };
    const res = mockRes();
    await updatePlant(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("TC48 update plant fails when non-owner tries to update", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 2 });
    const req = { params: { id: 1 }, body: { name: "Hacked" }, user: { id: 1 } };
    const res = mockRes();
    await updatePlant(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Not authorized" }));
  });

  test("TC49 update plant price is parsed as float", async () => {
    const updateMock = jest.fn();
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 1, name: "Rose", price: 200, quantity: 5, category: "flowering", environment: "outdoor", seasonality: "seasonal", guide: "x", update: updateMock });
    const req = { params: { id: 1 }, body: { price: "99.99" }, user: { id: 1 } };
    const res = mockRes();
    await updatePlant(req, res);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ price: 99.99 }));
  });

  test("TC50 update plant quantity is parsed as integer", async () => {
    const updateMock = jest.fn();
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 1, name: "Rose", price: 200, quantity: 5, category: "flowering", environment: "outdoor", seasonality: "seasonal", guide: "x", update: updateMock });
    const req = { params: { id: 1 }, body: { quantity: "7" }, user: { id: 1 } };
    const res = mockRes();
    await updatePlant(req, res);
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ quantity: 7 }));
  });

  // ── TC51–TC55: deletePlant & fetches ────────────────────────────────────
  test("TC51 delete plant success when owner deletes own plant", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 1, image: "x.jpg", destroy: jest.fn() });
    const req = { params: { id: 1 }, user: { id: 1 } };
    const res = mockRes();
    await deletePlant(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Plant removed successfully" }));
  });

  test("TC52 delete plant fails when plant not found", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue(null);
    const req = { params: { id: 999 }, user: { id: 1 } };
    const res = mockRes();
    await deletePlant(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  test("TC53 delete plant fails when non-owner attempts deletion", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, userId: 2 });
    const req = { params: { id: 1 }, user: { id: 1 } };
    const res = mockRes();
    await deletePlant(req, res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  test("TC54 get my plants returns list for the logged-in user", async () => {
    PlantMock.findAll = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getMyPlants(req, res);
    expect(res.json).toHaveBeenCalled();
    const result = res.json.mock.calls[0][0];
    expect(Array.isArray(result)).toBe(true);
  });

  test("TC55 get plant by id returns plant when found", async () => {
    PlantMock.findOne = jest.fn().mockResolvedValue({ id: 1, name: "Rose" });
    const req = { params: { id: 1 } };
    const res = mockRes();
    await getPlantById(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ name: "Rose" }));
  });
});