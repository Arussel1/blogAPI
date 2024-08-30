import { Request, Response, NextFunction } from 'express';
import { PostQueries, Post, UserQueries } from './../config/queries';
import { body, validationResult } from 'express-validator';

const postQueries = new PostQueries();
const userQueries = new UserQueries();

const post = {
    list: async (req: Request, res: Response) => {
       try {
        const posts = await postQueries.getAllPosts();
        const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        const author = await userQueries.getUserById(Number(post.authorId));
    return {
        ...post,
        authorName: author ? author.firstname + " " + author.lastname : 'Unknown', // Add author's name to the post
    };
}));
        return res.status(200).json(postsWithAuthors);
       } catch (error) {
          console.error("Error fetching post info:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
    },
    new: [
        body('title', 'Title must not be empty.').trim().isLength({ min: 1 }),
        body('content', 'Blog body must be a minimum of 3 characters')
        .trim()
        .isLength({ min: 3 }),
    ]
}

export { post }