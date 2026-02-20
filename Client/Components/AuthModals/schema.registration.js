import { z } from "zod";

export const RegistrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .regex(
        /^[A-Za-z]+( [A-Za-z]+)*$/,
        "Full name must contain only letters and spaces"
      )
      .refine(
        (val) => val.replace(/\s/g, "").length >= 5,
        "Full name must be at least 5 letters"
      ),
    email: z.string().email("Invalid email address"),
    phone: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((val) => {
        const birthDate = new Date(val);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        // Accurate age check: adjust if birthday hasn't happened yet this year
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age >= 18;
      }, "You must be at least 18 years old"),
    password: z.string().superRefine((val, ctx) => {
      if (val.length < 8) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "At least 8 characters" });
      }
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Include an uppercase letter" });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Include a lowercase letter" });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Include a number" });
      }
      if (!/[^A-Za-z0-9]/.test(val)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Include a special character" });
      }
    }),
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match",
  });