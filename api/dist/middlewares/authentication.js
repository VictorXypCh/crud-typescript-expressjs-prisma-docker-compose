"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authUtil_1 = __importDefault(require("../utils/authUtil"));
const authorize = (allows) => (req, res, next) => {
    var _a;
    try {
        let jwt = req.headers.authorization;
        // verify request has token
        if (!jwt) {
            return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwt.toLowerCase().startsWith('bearer')) {
            jwt = jwt.slice('bearer'.length).trim();
        }
        // verify token hasn't expired yet
        const decodedToken = authUtil_1.default.decodeToken(jwt);
        req.user = decodedToken;
        if (allows && (allows === null || allows === void 0 ? void 0 : allows.length) > 0 && !(allows === null || allows === void 0 ? void 0 : allows.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role.toUpperCase()))) {
            throw new Error('AccessDeniedError');
        }
        next();
    }
    catch (error) {
        //console.error(error);
        console.log(error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Expired token' });
        }
        else if (error.message === 'AccessDeniedError') {
            return res.status(401).json({ message: 'Access Denied' });
        }
        return res.status(500).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
    }
};
exports.authorize = authorize;
