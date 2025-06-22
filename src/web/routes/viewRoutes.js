import express from 'express';
const router = express.Router();

router.get('/create-accommodation', (req, res) => {
  res.render('accommodations/new'); // tu vista EJS
});



// Renderiza el formulario para crear un nuevo alojamiento
router.get('/createAccommodation', (req, res) => {
    res.render('CreateAccommodation');});

export default router;