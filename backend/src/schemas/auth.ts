import z from "zod"

export const googleJWTSchema = z.object({
    googleJWT: z.string()
});

export type GoogleJWT = z.infer<typeof googleJWTSchema>;
