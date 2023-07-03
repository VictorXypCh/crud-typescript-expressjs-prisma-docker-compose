import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authorize } from '../middlewares/authentication';
import authUtil from '../utils/authUtil';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to authorize the request

// Get all posts with their authors
router.get('/', async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({
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
    } catch (error) {
        console.error('Error retrieving posts:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a single post by ID with its author
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const post = await prisma.post.findUnique({
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
        } else {
            res.status(404).json({ error: 'Post not found' });
        }
    } catch (error) {
        console.error('Error retrieving post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new post
router.post('/', authorize(), async (req: Request, res: Response) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;
        console.log('userId: ', userId)
        const post = await prisma.post.create({
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
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a post
router.put('/:id', authorize(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id; // Accessed from the authorize middleware

        // Check if the user is the post owner or has admin roles
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            include: {
                author: true
            },
        });
        console.log(post);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId !== userId && !authUtil.isAdmin(req.user)) {
            return res.status(403).json({ error: 'Unauthorized to update this post' });
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: {
                title,
                content,
            },
        });

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a post
router.delete('/:id', authorize(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Accessed from the authorize middleware

        // Check if the user is the post owner or has admin roles
        const post = await prisma.post.findUnique({
            where: { id: Number(id) },
            select: {
                authorId: true,
            },
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.authorId !== userId && !authUtil.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }

        await prisma.post.delete({
            where: { id: Number(id) },
        });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
export default router

