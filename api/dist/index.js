"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./config/logger"));
dotenv_1.default.config();
const NAMESPACE = 'Server';
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use((req, res, next) => {
    /** Log the req */
    logger_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on("finish", () => {
        /** Log the res */
        logger_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });
    next();
});
app.get('/', (req, res) => {
    res.send('CRUD API');
});
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const postRouter_1 = __importDefault(require("./routes/postRouter"));
const commentRouter_1 = __importDefault(require("./routes/commentRouter"));
app.use("/user", userRouter_1.default);
app.use("/post", postRouter_1.default);
app.use("/comment", commentRouter_1.default);
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
