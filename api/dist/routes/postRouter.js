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
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authentication_1 = require("../middlewares/authentication");
const authUtil_1 = __importDefault(require("../utils/authUtil"));
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
// Middleware to authorize the request
// Get all posts with their authors
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield prisma.post.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        fullname: true,
                        username: true,
                        role: true
                    }
                },
                comments: true
            },
        });
        res.json(posts);
    }
    catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Get a single post by ID with its author
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const post = yield prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        id: true,
                        fullname: true,
                        username: true,
                        role: true
                    }
                },
                comments: true
            },
        });
        if (post) {
            res.json(post);
        }
        else {
            res.status(404).json({ error: 'Post not found' });
        }
    }
    catch (error) {
        console.error('Error retrieving post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Create a new post
router.post('/', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;
        console.log('userId: ', userId);
        const post = yield prisma.post.create({
            data: {
                title,
                content,
                author: { connect: { id: userId } },
            },
            include: {
                author: {
                    select: {
                        id: true,
                        fullname: true,
                        username: true,
                        role: true
                    }
                }
            },
        });
        res.json(post);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Update a post
router.put('/:id', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id; // Accessed from the authorize middleware
        // Check if the user is the post owner or has admin roles
        const post = yield prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                author: true
            },
        });
        console.log(post);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.authorId !== userId && !authUtil_1.default.isAdmin(req.user)) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }
        const updatedPost = yield prisma.post.update({
            where: { id: Number(id) },
            data: {
                title,
                content,
            },
        });
        res.json(updatedPost);
    }
    catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Delete a post
router.delete('/:id', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Accessed from the authorize middleware
        // Check if the user is the post owner or has admin roles
        const post = yield prisma.post.findUnique({
            where: { id: Number(id) },
            select: {
                authorId: true,
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.authorId !== userId && !authUtil_1.default.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }
        yield prisma.post.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
