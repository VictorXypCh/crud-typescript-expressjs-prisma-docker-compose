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
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authUtil = {
    generatePassword: (password) => __awaiter(void 0, void 0, void 0, function* () {
        const salt = yield bcrypt_1.default.genSalt(10);
        // The bcrypt is used for encrypting password.
        return yield bcrypt_1.default.hash(password, salt);
    }),
    verifyPassword: (password, hashedPassword) => __awaiter(void 0, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, hashedPassword);
    }),
    decodeToken: (token) => {
        var _a;
        return jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET_KEY) !== null && _a !== void 0 ? _a : "kAs021l12lka@!@#!@0_*SAK@2kl1232");
    },
    verify: (token) => {
        var _a;
        return jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET_KEY) !== null && _a !== void 0 ? _a : "kAs021l12lka@!@#!@0_*SAK@2kl1232");
    },
    isAdmin: (request) => request.user && request.user.role === 'ADMIN'
};
exports.default = authUtil;
