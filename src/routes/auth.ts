import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';

const router = express.Router();

// Define the User type according to your UserModel
interface User {
  id: string;
  email: string;
  password: string;
  // Add other fields as necessary
}

/* POST login. */
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, (err: any, user: User | false, info: { message: string }) => {
    if (err || !user) {
      return res.status(400).json({
        message: 'Something is not right',
        user: user,
      });
    }

    req.login(user, { session: false }, (err: any) => {
      if (err) {
        return res.send(err);
      }

      // Generate a signed JWT with the contents of the user object and return it in the response
      const token = jwt.sign(user, 'your_jwt_secret');
      return res.json({ user, token });
    });
  })(req, res);
});

export default router;
