
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import logger from './config/logger';

dotenv.config();

const NAMESPACE = 'Server'
const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
    /** Log the req */
    logger.info(
        NAMESPACE,
        `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
        /** Log the res */

        logger.info(
            NAMESPACE,
            `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`
        );
    });
    next();
});


app.get('/', (req: Request, res: Response) => {
    res.send('CRUD API');
});

import userRouter from './routes/userRouter'
import postRouter from './routes/postRouter'
import commentRouter from './routes/commentRouter'

app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/comment", commentRouter);

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
