import { User } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Request } from 'express';
import jwt from "jsonwebtoken";
const authUtil = {
    generatePassword: async (password: string) => {
        const salt = await bcrypt.genSalt(10)
        // The bcrypt is used for encrypting password.
        return await bcrypt.hash(password, salt);
    },
    verifyPassword: async (password: string, hashedPassword: string) => {
        return await bcrypt.compare(password, hashedPassword);
    },
    decodeToken: (token: string) => {
        return jwt.verify(token, process.env.JWT_SECRET_KEY ?? "kAs021l12lka@!@#!@0_*SAK@2kl1232");
    },
    verify: (token: string) => {
        return jwt.verify(token, process.env.JWT_SECRET_KEY ?? "kAs021l12lka@!@#!@0_*SAK@2kl1232");
    },
    isAdmin: (request: Request) => request.user && request.user.role === 'ADMIN'
}

export default authUtil;


