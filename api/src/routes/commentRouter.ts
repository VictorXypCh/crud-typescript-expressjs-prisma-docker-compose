import express, { Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authorize } from '../middlewares/authentication';
import authUtil from '../utils/authUtil';


const prisma = new PrismaClient();
const router = express.Router();

// Get all comments for a post
router.get('/posts/:postId', async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const comments = await prisma.comment.findMany({
            where: { postId: Number(postId) },
            include: {
                author: {
                    select:
                    {
                        username: true,
                        fullname: true,
                    }
                }
            }
        });
        res.json(comments);
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Get Comment By Id
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const comments = await prisma.comment.findFirst({
            where: { id: Number(id) },
            include: {
                author: {
                    select:
                    {
                        username: true,
                        fullname: true,
                    }
                }
            }
        });
        res.json(comments);
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new comment for a post
router.post('/posts/:postId', authorize(), async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;
        const userId = req.user.id

        const comment = await prisma.comment.create({
            data: {
                content,
                author: { connect: { id: userId } },
                post: { connect: { id: Number(postId) } },
            }
        });

        res.json(comment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Update a comment
router.put('/:id', authorize(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id; // Accessed from the authorize middleware

        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user is the comment author 
        if (comment.authorId !== userId) {
            return res.status(403).json({ error: 'No permission to update this comment' });
        }

        const updatedComment = await prisma.comment.update({
            where: { id: Number(id) },
            data: { content },
        });

        res.json(updatedComment);
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a comment
router.delete('/:id', authorize(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Accessed from the authorize middleware

        const comment = await prisma.comment.findUnique({
            where: { id: Number(id) },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if the user is the comment owner or has admin roles
        if (comment.authorId !== userId && !authUtil.isAdmin(req)) {
            return res.status(403).json({ error: 'Unauthorized to delete this comment' });
        }

        await prisma.comment.delete({
            where: { id: Number(id) },
        });

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

