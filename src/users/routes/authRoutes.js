// src/users/routes/authRoutes.js
import express from 'express';
import MongoUserRepository from '../infrastructure/MongoUserRepository.js';

const router = express.Router();
const userRepo = new MongoUserRepository();

router.post('/login', async (req, res) => {
  try {
    const loginUser = new LoginUser(userRepo);
    const userData = await loginUser.execute(req.body);
    
    // Puedes guardar datos en sesión aquí si usas express-session
    req.session.user = userData;

    res.redirect('/dashboard'); // o res.json(userData)
  } catch (err) {
    res.status(401).render('login', { error: err.message });
  }
});

export default router;
