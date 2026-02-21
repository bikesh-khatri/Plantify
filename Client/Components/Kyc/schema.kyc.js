import { z } from "zod";

export const KycSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  address: z.string().min(5, "Complete address is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be 10 digits").max(15),
  // Enum ensures they only pick from these 3 options
  idType: z.enum(["citizenship", "passport", "license"], {
    errorMap: () => ({ message: "Please select a valid ID type" }),
  }),
});