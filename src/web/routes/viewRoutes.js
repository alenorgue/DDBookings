import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
  res.send('¡Bienvenido a la API de alojamiento!');
});


// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', (req, res) => {
    res.render('CreateAccommodation');});

// Renderiza el formulario para registrar un nuevo usuario
router.get('/registerUser', (req, res) => {
    res.render('RegisterUser');});

// Renderiza el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('Login');});
    
export default router;