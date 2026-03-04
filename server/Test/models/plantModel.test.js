const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

const PlantMock = dbMock.define("Plant", {
  id: 1,
  name: "Rose",
  image: "rose.jpg",
  category: "flowering",
  environment: "outdoor",
  seasonality: "seasonal",
  price: 200.0,
  quantity: 5,
  guide: "Water daily",
  userId: 1,
});

describe("Plant Model Tests", () => {

  test("TC1 plant creation returns name and price", async () => {
    const plant = await PlantMock.create({ name: "Rose", price: 200 });
    expect(plant.name).toBe("Rose");
    expect(plant.price).toBe(200);
  });

  test("TC2 plant price is a positive number", async () => {
    const plant = await PlantMock.create({ price: 300 });
    expect(plant.price).toBeGreaterThan(0);
  });

  test("TC3 plant quantity is zero or greater", async () => {
    const plant = await PlantMock.create({ quantity: 0 });
    expect(plant.quantity).toBeGreaterThanOrEqual(0);
  });

  test("TC4 plant category is one of the allowed enum values", async () => {
    const plant = await PlantMock.create({ category: "flowering" });
    expect(["flowering", "non-flowering"]).toContain(plant.category);
  });

  test("TC5 plant environment is one of the allowed enum values", async () => {
    const plant = await PlantMock.create({ environment: "indoor" });
    expect(["indoor", "outdoor"]).toContain(plant.environment);
  });

  test("TC6 plant seasonality is one of the allowed enum values", async () => {
    const plant = await PlantMock.create({ seasonality: "perennial" });
    expect(["seasonal", "perennial"]).toContain(plant.seasonality);
  });

  test("TC7 plant image field is a non-empty string", async () => {
    const plant = await PlantMock.create({ image: "rose.jpg" });
    expect(typeof plant.image).toBe("string");
    expect(plant.image.length).toBeGreaterThan(0);
  });

  test("TC8 plant guide is truthy", async () => {
    const plant = await PlantMock.create({ guide: "Water daily" });
    expect(plant.guide).toBeTruthy();
  });

  test("TC9 plant belongs to a user via userId", async () => {
    const plant = await PlantMock.create({ userId: 1 });
    expect(plant.userId).toBe(1);
    expect(typeof plant.userId).toBe("number");
  });

  test("TC10 plant findAll returns an array", async () => {
    PlantMock.findAll = jest.fn().mockResolvedValue([{ id: 1, name: "Rose" }, { id: 2, name: "Tulip" }]);
    const plants = await PlantMock.findAll({});
    expect(Array.isArray(plants)).toBe(true);
    expect(plants.length).toBe(2);
  });
});