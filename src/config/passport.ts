import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy} from 'passport-jwt';
// import { UserModel } from './models/UserModel'; // Adjust the import path as needed
import { Request, Response, NextFunction } from 'express';

interface User {
  id: string;
  email: string;
  password: string;
  // Add other fields as necessary
}

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async function (email: string, password: string, done: (error: any, user?: User | false, options?: { message: string }) => void) {
    
    try {
   /*   const user = await UserModel.findOne({ email, password }).exec();
      
      if (!user) {
        return done(null, false, { message: 'Incorrect email or password.' });
      }
      
      return done(null, user, { message: 'Logged In Successfully' }); */
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey : 'your_jwt_secret'
},
function (jwtPayload, cb) {

    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
 /*   return UserModel.findOneById(jwtPayload.id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        }); */
}
));
