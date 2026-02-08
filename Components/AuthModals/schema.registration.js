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
        const date = new Date(val);
        const age = (new Date() - date) / (1000 * 60 * 60 * 24 * 365);
        return age >= 18;
      }, "You must be at least 18 years old"),
    role: z.enum(["customer", "owner"], {
      errorMap: () => ({ message: "Please select a role" }),
    }),
    password: z.string().superRefine((val, ctx) => {
      if (val.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password must be at least 8 characters",
        });
      }
      if (!/[A-Z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must include an uppercase letter",
        });
      }
      if (!/[a-z]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must include a lowercase letter",
        });
      }
      if (!/[0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must include a number",
        });
      }
      if (!/[^A-Za-z0-9]/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Must include a special character",
        });
      }
    }),
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    path: ["rePassword"],
    message: "Passwords do not match",
  });