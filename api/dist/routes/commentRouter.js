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
// Get all comments for a post
router.get('/posts/:postId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const comments = yield prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                author: {
                    select: {
                        username: true,
                        fullname: true,
                    }
                }
            }
        });
        res.json(comments);
    }
    catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Get Comment By Id
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const comments = yield prisma.comment.findFirst({
            where: { id: Number(id) },
            include: {
                author: {
                    select: {
                        username: true,
                        fullname: true,
                    }
                }
            }
        });
        res.json(comments);
    }
    catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Create a new comment for a post
router.post('/posts/:postId', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const comment = yield prisma.comment.create({
            data: {
                content,
                author: { connect: { id: userId } },
                post: { connect: { id: Number(postId) } },
            }
        });
        res.json(comment);
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Update a comment
router.put('/:id', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id; // Accessed from the authorize middleware
        const comment = yield prisma.comment.findUnique({
            where: { id: Number(id) },
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        // Check if the user is the comment author 
        if (comment.authorId !== userId) {
            return res.status(403).json({ error: 'No permission to update this comment' });
        }
        const updatedComment = yield prisma.comment.update({
            where: { id: Number(id) },
            data: { content },
        });
        res.json(updatedComment);
    }
    catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// Delete a comment
router.delete('/:id', (0, authentication_1.authorize)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Accessed from the authorize middleware
        const comment = yield prisma.comment.findUnique({
            where: { id: Number(id) },
        });
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        // Check if the user is the comment owner or has admin roles
        if (comment.authorId !== userId && !authUtil_1.default.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }
        yield prisma.comment.delete({
            where: { id: Number(id) },
        });
        res.json({ message: 'Comment deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
exports.default = router;
