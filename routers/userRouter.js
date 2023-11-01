const express = require('express');
const router = express.Router();

const {
    sendPINForm,
    userLogin,
    userLogout,
    userHome,
    createKlok
} = require("../controllers/userController");


router.get("/", sendPINForm)

// --------------- USER LOGIN

router.get("/user/login", sendPINForm)

router.post("/user/login", userLogin)

router.get("/user/logout", userLogout);

router.get("/user/home/:id", userHome)


// USER KLOK

router.post("/user/home/:id/klok", createKlok)

module.exports = router