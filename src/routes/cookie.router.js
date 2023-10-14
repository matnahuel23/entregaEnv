const express = require('express');
const router = express.Router();

router.get('/setCookie', (req, res) => {
    res.cookie('CoderCookie', 'Esta es una cookie muy poderosa', { maxAge: 10000 });
    res.send("Cookie establecida");
})

router.get('/getCookie', (req, res) => {
    // Obtengo las req.cookies y las envio al cliente para corroborar que hay almacenado
    res.send(req.cookies);
})

router.get('/deleteCookie', (req, res)=>{
    res.clearCookie('CoderCookie').send('Cookie Remove')
})

router.get('/setSignedCookie',(req,res)=>{
    res.cookie('SignedCookie', 'Esta es una cookie firmada', { maxAge: 10000, signed: true });
    res.send("Cookie firmada establecida");
})

module.exports = router;