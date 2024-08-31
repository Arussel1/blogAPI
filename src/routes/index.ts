import express from 'express';
import cors from 'cors';
import {  admin, verifyToken, isAdmin } from './../controllers/admin';
import { user } from './../controllers/user';
import { post, comment } from './../controllers/post';
const router = express.Router();

router.post('/admin/login', cors(), admin.login);

router.post('/admin/signup', cors(), admin.create);

router.post('/users/signup', cors(), user.create);
  
router.post('/users/login', cors(), user.login);

router.get('/users/:userId', cors(), verifyToken, user.getInfo);

router.put('/users/:userId', cors(), verifyToken, user.update);

router.delete('/users/:userId', cors(), verifyToken, user.delete);

router.get('/posts', cors(), verifyToken, post.list);

router.get('/posts/:postId', cors(), verifyToken, post.listSpecific);

router.post('/posts', cors(), verifyToken, isAdmin, post.new);

 router.put('/posts/:postId', cors(), verifyToken, isAdmin, post.update);

router.patch('/posts/:postId', cors(), verifyToken, isAdmin, post.changeStatus);

router.post('/posts/:postId/comments', cors(), verifyToken, comment.create);

router.delete('/posts/:postId', cors(), verifyToken, isAdmin, post.delete); 


export default router