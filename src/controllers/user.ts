import {Request, Response, NextFunction} from 'express';
import { UserQueries, Role, User } from './../config/queries';
import { body, validationResult} from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import passport from 'passport';
interface AuthenticatedRequest extends Request {
    token?: string;
  }
  
interface Info {
  message?: string;
}

const userQueries = new UserQueries();

const user = {
    create:[
        body('firstname')
        .trim()
        .notEmpty()
        .withMessage('First name is required')
        .escape(),
    body('lastname')
        .trim()
        .notEmpty()
        .withMessage('Last name is required')
        .escape(),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 20 })
        .withMessage('Username must be between 3 and 20 characters long')
        .matches(/^[a-zA-Z0-9_.]+$/)
        .withMessage('Username must contain only letters, numbers, underscores, or periods')
        .escape()
        .custom( async (value) => {
            const user = await userQueries.getUser(value);
            if (user) {
            throw new Error('Username already exists');
            }
            return true;
        }),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8, max: 64 })
        .withMessage('Password must be between 8 and 64 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),
    body('confirmpassword')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords do not match'),

    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json( {errors: errors.array()})
        }
        
        try {
        const { firstname, lastname, username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userQueries.addUser(firstname, lastname, username, hashedPassword, Role.USER);
        return res.status(201).json({
            mesaage: 'Member created sucessfully'
        });
            } catch (error) {
            console.error('Error during user sign-up:', error);
            return res.status(500).json({
                errors: [{ msg: 'An error occurred during sign-up. Please try again.' }],});
            }
        }
    ],

    showUser: async (req: Request, res: Response) => {
        const user = await userQueries.getUserById(Number(req.params.id));
        res.status(200).json(user);
    },

    login: [
    body('username', 'Username does not exist')
      .trim()
      .escape()
      .custom(async (username) => {
        const user = await userQueries.getUser(username);
        if (!user) {
          throw new Error('Username does not exist');
        }
        return true;
      }),
    body('password', 'Incorrect password')
      .trim()
      .escape()
      .custom(async (password, { req }) => {
        const user = await userQueries.getUser(req.body.username);
        if (!user) {
          throw new Error('Username does not exist');
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          throw new Error('Incorrect password');
        }
        return true;
      }),
    async (req: Request, res: Response, next: NextFunction) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      passport.authenticate('local', { session: false }, (err: Error, user: User, info: Info) => {
        if (err || !user) {
          return res.status(400).json({
            message: 'Authentication failed',
            errors: info ? [info.message] : ['Authentication error'],
          });
        }
        req.login(user, { session: false }, (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error logging in', error: err });
          }

          const secret = process.env.FOO_COOKIE_SECRET;
          if (!secret) {
            return res.status(500).json({ message: 'Internal Server Error: Missing secret key' });
          }
          const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
          return res.json({  token });
        });
      })(req, res, next); 
    },
  ],
      getInfo: async (req: Request, res: Response) => {
        try {
          const userId = Number(req.params.userId);
          const user = await userQueries.getUserById(userId);
    
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
    
          return res.status(200).json({
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
          });
        } catch (error) {
          console.error("Error fetching user info:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      },
    
      update: async (req: Request, res: Response) => {
        try {
          const { firstname, lastname, username, password } = req.body;
          const id = Number(req.params.userId);
          if (!firstname || !lastname || !username || !password) {
            return res.status(400).json({ message: "All fields are required" });
          }
    
          const updatedUser = await userQueries.updateUser(
            id,
            firstname,
            lastname,
            username,
            password
          );
    
          if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
          }
    
          return res.status(200).json({ message: "User updated successfully" });
        } catch (error) {
          console.error("Error updating user:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      },
      delete: async (req: Request, res: Response) => {
        try {
          const id = Number(req.params.userId);
          const deletedUser = await userQueries.deleteUser(id);
    
          if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
          }
    
          return res.status(200).json({ message: "User deleted successfully" });
        } catch (error) {
          console.error("Error deleting user:", error);
          return res.status(500).json({ message: "Internal server error" });
        }
      },
}

export { user }