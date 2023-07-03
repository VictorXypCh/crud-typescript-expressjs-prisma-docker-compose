"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = (0, express_1.Router)();
const authUtil_1 = __importDefault(require("../utils/authUtil"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authentication_1 = require("../middlewares/authentication");
const logger_1 = __importDefault(require("../config/logger"));
const authUtil_2 = __importDefault(require("../utils/authUtil"));
router.get("/", (0, authentication_1.authorize)(['ADMIN']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield prisma.user.findMany();
        res.json(result);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
}));
router.get("/:id", (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const userId = req.user.id;
        if (id !== userId && !authUtil_2.default.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to access this resource' });
        }
        const result = yield prisma.user.findFirst({
            where: {
                id: Number(id)
            }
        });
        res.json(result);
    }
    catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { username, password, fullname, role } = req.body;
        if (!fullname || !username || !password) {
            return res.status(400).json({ message: "fullname, username and password are required." });
        }
        if (!role)
            role = 'USER';
        // Encryption of the string password
        const hash = yield authUtil_1.default.generatePassword(password);
        let data = {
            username,
            password: hash,
            fullname,
            role,
        };
        const insert = yield prisma.user.create({ data: data });
        delete insert.password;
        res.json(insert);
    }
    catch (error) {
        logger_1.default.error('User', 'user create', error);
        if (error.meta && error.meta.target === "User_username_key") {
            return res.status(400).json({ message: "user with this username is already exist." });
        }
        return res.status(400).send(error);
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let { username, password } = req.body;
        console.log(req.body);
        if (!username || !password) {
            throw new Error("username and password are required");
        }
        // Encryption of the string password
        const user = yield prisma.user.findUnique({
            where: {
                username: username,
            },
        });
        const verify = yield authUtil_1.default.verifyPassword(password, (_a = user === null || user === void 0 ? void 0 : user.password) !== null && _a !== void 0 ? _a : "");
        if (!user || !verify)
            throw new Error("invalid credential");
        const tokenData = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(tokenData, (_b = process.env.JWT_SECRET_KEY) !== null && _b !== void 0 ? _b : "kAs021l12lka@!@#!@0_*SAK@2kl1232");
        res.send(token);
    }
    catch (error) {
        res.status(400).send(error);
    }
}));
router.put("/", (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { password, fullname, role } = req.body;
        let id = req.user.id;
        if (!id || !password) {
            throw new Error("invalid");
        }
        let body = {};
        //: Prisma.UserUpdateInput;
        // Encryption of the string password
        if (password) {
            body.password = yield authUtil_1.default.generatePassword(password);
        }
        if (fullname) {
            body.fullname = fullname;
        }
        if (role) {
            body.role = role;
        }
        body = body;
        const update = yield prisma.user.update({
            where: {
                id: Number(id)
            },
            data: body
        });
        delete update.password;
        res.json(update);
    }
    catch (error) {
        logger_1.default.error('User', 'user update', error);
        res.status(400).send('Something went wrong');
    }
}));
router.delete("/:id", (0, authentication_1.authorize)(['ADMIN']), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const result = yield prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        delete result.password;
        res.json(result);
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
