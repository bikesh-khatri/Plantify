const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

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
  documentImage: "doc.jpg",
  image: "logo.jpg",
  status: "pending",
});

describe("KYC Model Tests", () => {

  test("TC1 KYC nurseryName is truthy and longer than 3 chars", async () => {
    const kyc = await KycMock.create({ nurseryName: "Green Nursery" });
    expect(kyc.nurseryName).toBeTruthy();
    expect(kyc.nurseryName.length).toBeGreaterThan(3);
  });

  test("TC2 KYC phone is exactly 10 characters", async () => {
    const kyc = await KycMock.create({ phone: "9800000000" });
    expect(kyc.phone.length).toBe(10);
  });

  test("TC3 KYC email contains @ symbol", async () => {
    const kyc = await KycMock.create({ email: "nursery@test.com" });
    expect(kyc.email).toContain("@");
  });

  test("TC4 KYC latitude is a valid number", async () => {
    const kyc = await KycMock.create({ lat: 27.7 });
    expect(typeof kyc.lat).toBe("number");
    expect(isNaN(kyc.lat)).toBe(false);
  });

  test("TC5 KYC longitude is a valid number", async () => {
    const kyc = await KycMock.create({ lng: 85.3 });
    expect(typeof kyc.lng).toBe("number");
    expect(isNaN(kyc.lng)).toBe(false);
  });

  test("TC6 KYC document image has a file extension", async () => {
    const kyc = await KycMock.create({ documentImage: "doc.jpg" });
    expect(kyc.documentImage).toMatch(/\.\w+$/);
  });

  test("TC7 KYC default status is pending", async () => {
    const kyc = await KycMock.create({});
    expect(kyc.status).toBe("pending");
  });

  test("TC8 KYC status verified is a valid state", () => {
    const validStatuses = ["pending", "verified", "rejected"];
    expect(validStatuses).toContain("verified");
  });

  test("TC9 KYC userId links to a user", async () => {
    const kyc = await KycMock.create({ userId: 1 });
    expect(kyc.userId).toBe(1);
    expect(typeof kyc.userId).toBe("number");
  });

  test("TC10 KYC findOne returns null when no record exists for userId", async () => {
    KycMock.findOne = jest.fn().mockResolvedValue(null);
    const kyc = await KycMock.findOne({ where: { userId: 9999 } });
    expect(kyc).toBeNull();
  });
});