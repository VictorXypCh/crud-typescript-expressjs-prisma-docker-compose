import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();
import Authentication from "../utils/authUtil";
import jwt from "jsonwebtoken";
import { authorize } from "../middlewares/authentication";
import logger from "../config/logger";
import authUtil from "../utils/authUtil";
router.get("/", authorize(['ADMIN']), async (req, res) => {
    try {
        const result = await prisma.user.findMany();
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});

router.get("/:id", authorize(), async (req, res) => {
    try {

        const id = req.params.id;
        const userId = req.user.id;
        if (id !== userId && !authUtil.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to access this resource' });
        }
        const result = await prisma.user.findFirst({
            where: {
                id: Number(id)
            }
        });
        res.json(result);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error });
    }
});
router.post("/", async (req, res) => {
    try {
        let { username, password, fullname, role } = req.body;
        if (!fullname || !username || !password) {
            return res.status(400).json({ message: "fullname, username and password are required." })
        }

        if (!role) role = 'USER';

        // Encryption of the string password
        const hash = await Authentication.generatePassword(password);


        let data: Prisma.UserCreateInput = {
            username,
            password: hash,
            fullname,
            role,
        };

        const insert: any = await prisma.user.create({ data: data });
        delete insert.password;

        res.json(insert);
    } catch (error: any) {
        logger.error('User', 'user create', error);
        if (error.meta && error.meta.target === "User_username_key") {
            return res.status(400).json({ message: "user with this username is already exist." })
        }
        return res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        let { username, password } = req.body;
        console.log(req.body);
        if (!username || !password) {
            throw new Error("username and password are required");
        }

        // Encryption of the string password
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
        });

        const verify = await Authentication.verifyPassword(
            password,
            user?.password ?? ""
        );

        if (!user || !verify) throw new Error("invalid credential");

        const tokenData = {
            id: user.id,
            username: user.username,
            fullname: user.fullname,
            role: user.role,
        };


        const token = jwt.sign(
            tokenData,
            process.env.JWT_SECRET_KEY ?? "kAs021l12lka@!@#!@0_*SAK@2kl1232"
        );

        res.send(token);
    } catch (error) {
        res.status(400).send(error);
    }
});


router.put("/:id", authorize(), async (req, res) => {
    try {
        let { password, fullname, role } = req.body;
        let id = req.params.id;
        const userId = req.user.id
        if (!id || !password || !fullname) {
            throw new Error("invalid");
        }

        if (id !== userId && !authUtil.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to access this resource' });
        }


        let body: any = {};
        //: Prisma.UserUpdateInput;
        // Encryption of the string password
        if (password) {
            body.password = await Authentication.generatePassword(password);
        }

        if (fullname) {
            body.fullname = fullname;
        }
        if (role) {
            body.role = role;
        }


        body = body as Prisma.UserUpdateInput;


        const update: any = await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: body
        });

        delete update.password;

        res.json(update);
    } catch (error) {
        logger.error('User', 'user update', error);
        res.status(400).send('Something went wrong');
    }
});



router.delete("/:id", authorize(['ADMIN']), async (req, res) => {
    try {
        const { id } = req.params;
        const result: any = await prisma.user.delete({
            where: {
                id: Number(id),
            },
        });
        delete result.password;
        res.json(result);
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default router;

