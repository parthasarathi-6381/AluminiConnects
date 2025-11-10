
import  {authorizeRoles}  from '../middleware/authorizeRole.js'; 
import express from 'express';
import { createPost, getPostsByDept, getPost, commentOnPost, deletePost } from '../controllers/discussionController.js';
//import { auth } from '../middleware/auth.middleware.js';
import verifyFirebaseToken from '../middleware/verifyFirebaseToken.js';

const route = express.Router();
route.get('/:department', verifyFirebaseToken,authorizeRoles("student","admin","clubMember","alumini"),getPostsByDept);          // GET /api/discussion/CSE
route.post('/:department', verifyFirebaseToken,authorizeRoles("student","admin","clubMember","alumini") ,createPost);            // POST /api/discussion/CSE
route.get('/post/:id', verifyFirebaseToken,authorizeRoles("student","admin","clubMember","alumini"), getPost);                   // GET single post
route.post('/post/:id/comment', verifyFirebaseToken,authorizeRoles("student","admin","clubMember","alumini"), commentOnPost);    // POST comment
route.delete('/post/:id', verifyFirebaseToken,authorizeRoles("admin") , deletePost);    // admin delete

export default route;