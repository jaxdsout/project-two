const express = require('express');
const router = express.Router();

const { 
    sendNewAdminForm, sendLoginForm, createNewAdmin, adminHome, adminLogin, adminLogout,    
    findAllUsers, findAllProjects,
    createUser, updateUser, 
    deleteUser,
    createProject, updateProject, deleteProject, createKlok, updateKlok, deleteKlok
} = require("../controllers/adminController")


// --------------- ADMIN LOGIN & SETUP

router.get("/login", sendLoginForm);

router.post("/login", adminLogin);

router.get("/logout", adminLogout);

router.get("/new", sendNewAdminForm);

router.post("/signup", createNewAdmin)


// FIND ALL USERS & PROJECTS {POSTMAN}

router.get("/find-user/all", findAllUsers)

router.get("/find-projects/all", findAllProjects)
 

// DASHBOARD 

router.get("/home/:id", adminHome)


// ADMIN C(R)UD -- USER

router.post("/new-user", createUser)

router.put("/edit-user/:id", updateUser)

router.delete("/edit-user/:id/delete", deleteUser)


// ADMIN C(R)UD -- PROJECT

router.post("/new-project", createProject)

router.put("/edit-project/:id", updateProject)

router.delete("/edit-project/:id/delete", deleteProject)


// ADMIN C(R)UD -- KLOK

router.post("/new-klok", createKlok)

router.put("/edit-klok/:id", updateKlok)

router.delete("/edit-klok/:id/delete", deleteKlok)


module.exports = router