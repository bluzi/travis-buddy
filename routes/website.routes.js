const express = require('express');


const router = express.Router();

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/getting-started', (req, res) => {
  res.render('getting-started');
});

router.get('/contact-us', (req, res) => {
  res.render('contact-us');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard');
});


module.exports = router;
