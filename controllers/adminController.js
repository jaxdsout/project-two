const { User, Admin, Project, Klok } = require('../models/admin');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { JWT_KEY_SECRET } = require("../config")


// NEW - SEND FORM
const sendNewAdminForm = (req, res) => {
    let entryAccess = false
    if(req.cookies.admintoken) {
        entryAccess = true
    } 
    res.render('admin/newadmin.ejs', {entryAccess})
}


// NEW - POST NEW ADMIN
const createNewAdmin = async (req, res) => {
    const inputEmail = req.body.email.toLowerCase()
    const existingEmail = await Admin.findOne({ email: inputEmail });
    if (existingEmail) {
        return res.send("Email is already in use");
    }
    try {
        const encryptedPw = await bcrypt.hash(req.body.password, 12)
        const admin = await Admin.create({
            email: inputEmail,
            password: encryptedPw,
            fullname: req.body.fullname,
            organization: req.body.organization
        })
        const token = jwt.sign(
            { userId: admin.id, email: admin.email },
            JWT_KEY_SECRET,
            { expiresIn: '1hr' }
            );
        return res.cookie('admintoken', token).redirect(`/admin/home/${admin.id}`)  
    } catch (error) {
        console.error(error)
    }
}


// LOGIN - GET
const sendLoginForm = async (req, res) => {
    const token = req.cookies.admintoken
    let entryAccess = false;
    if(token) {
        entryAccess = true
        const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
        const adminID = decodedToken.userId
        const admin = await Admin.findOne({ _id: adminID })
        res.redirect(`/admin/home/${admin.id}`)
    } 
    res.render('admin/login.ejs', {entryAccess})
}

// LOGIN - POST 
const adminLogin = async (req, res) => {
    try{
        req.body.email = req.body.email.toLowerCase();
        const admin = await Admin.findOne({ email: req.body.email })
        if (!admin){
            return res.send('email not found')
        }
        const verify = await bcrypt.compare(req.body.password, admin.password);
        if (!verify) {
            return res.send("invalid password")
        }
        const token = jwt.sign(
            { userId: admin.id, email: admin.email },
            JWT_KEY_SECRET,
            // { expiresIn: '1hr' }
        );
        return res.cookie('admintoken', token).redirect(`/admin/home/${admin.id}`)
    } catch (error) {
        console.error(error)
    }
}

// LOGOUT
const adminLogout = (req, res, next) => {
    if(!req.cookies.admintoken) {
        return res.send('Failed to logout')
    }
    try {
        const data = jwt.verify(req.cookies.admintoken, JWT_KEY_SECRET)
        console.log("Logging out now", data)
        return res.clearCookie('admintoken').redirect('/admin/login')
    } catch (error) {
        console.error(error)
        res.send("Failed to logout")
    }
}


// ADMIN HOME PAGE
const adminHome = async (req, res) => {
        let entryAccess = false;
        if (req.cookies.admintoken) {
            entryAccess = true
            const admin = await Admin.findOne({ _id: req.params.id })
            const users = await User.find({ admin: req.params.id });
            let klokkies = [];
            for (const user of users) {
                klokkies = klokkies.concat(user.kloks)
            }
            res.render("admin/admin.ejs", { admin, users, klokkies, entryAccess})
        } else {
            res.send("error: no access granted")
        }
}



// CRUD USER

const createUser = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        if (isNaN(req.body.PIN)){
            return res.send("PIN must digits only");
        }
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminId = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminId })
            if (admin) {
                const exisitingPIN = await User.findOne({ PIN: req.body.PIN });
                if (exisitingPIN) {
                    return res.send("PIN is already in use");
                }
                const user = await User.create({
                    username: req.body.username,
                    PIN: req.body.PIN,
                    fullname: req.body.fullname,
                    startDate: req.body.startDate,
                    position: req.body.position,
                    hourlyPay: req.body.hourlyPay
                })
                user.admin = admin._id;
                await user.save();
                admin.users.push(user);
                await admin.save()
                return res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        } 
} else {
    res.send("error: no access granted")
}
}

const findAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        res.json({
        "data": users,
        "status": 200
        })
    }
    catch (error) {
      next(error);
    }
}

const updateUser = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const userID = req.body.userID;
                const user = await User.findOne({_id: userID, admin: adminID})
                if(user) {
                    user.username = req.body.username,
                    user.PIN = req.body.PIN,
                    user.fullname = req.body.fullname,
                    user.startDate = req.body.startDate,
                    user.position = req.body.position,
                    user.hourlyPay = req.body.hourlyPay
                    await user.save();

                    const userIndex = admin.users.findIndex(u => u._id.toString() === userID);
                    admin.users[userIndex] = user;
                    await admin.save();
                }
                res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            } 
    } catch (error) {
        console.error(error)
        }
    } else {
    res.send("error: no access granted")
    }
}

const deleteUser = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const userID = req.body.userID;
                const user = await User.findOne({
                    _id: userID, admin: adminID
                });
                if (user) {
                    admin.users.pull(user._id)
                    await admin.save()
                    const deletedUser = await User.deleteOne(user)
                    res.redirect(`/admin/home/${admin.id}`)
                } else {
                    res.send("user not found")
                }
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        }
    } else   {
        res.send("error: no access granted") 
    } 
}



// CRUD PROJECT

const createProject = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminId = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminId })
            if (admin) {
                const project = await Project.create({
                    name: req.body.name,
                    location: req.body.location,
                    projectStart: req.body.projectStart,
                    active: req.body.active,
                    projectType: req.body.projectType,
                })
                project.admin = admin._id
                await project.save()
                admin.projects.push(project)
                await admin.save()
                return res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        }
    } else {
        res.send("error: no access granted")
    }
}

const findAllProjects = async (req, res) => {
    try {
        const projects = await Project.find()
        res.json({
        "data": projects,
        "status": 200
        })
    }
    catch (error) {
      next(error);
    }
}

const updateProject = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const projectID = req.body.projectID;
                const project = await Project.findOne({_id: projectID, admin: adminID})
                if(project) {
                    project.name = req.body.name,
                    project.location = req.body.location,
                    project.projectStart = req.body.projectStart,
                    project.active = req.body.active,
                    project.projectType = req.body.projectType,
                    await project.save();

                    const projectsIndex = admin.projects.findIndex(p => p._id.toString() === projectID);
                    admin.projects[projectsIndex] = project;
                    await admin.save();
                }
                res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            } 
    } catch (error) {
        console.error(error)
        }
    } else {
    res.send("error: no access granted")
    }
}


const deleteProject = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const projectID = req.body.projectID;
                const project = await Project.findOne({
                    _id: projectID, admin: adminID
                });
                if (project) {
                    admin.projects.pull(project._id)
                    await admin.save()
                    const deletedProj = await Project.deleteOne(project)
                    res.redirect(`/admin/home/${admin.id}`)
                } else {
                    res.send("project not found")
                }
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        }
    } else   {
        res.send("error: no access granted") 
    } 
}


// C(R)UD KLOK

const createKlok = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminId = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminId })
            if (admin) {
                const klok = await Klok.create({
                    user: req.body.user,
                    project: req.body.project,
                    date: req.body.date,
                    description: req.body.description,
                    hours: req.body.hours
                })
                const user = await User.findOne({ fullname: req.body.user })
                user.kloks.push(klok)
                await user.save()
                admin.kloks.push(klok)
                await admin.save()
                return res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        }
    } else {
        res.send("error: no access granted")
    }
}

const updateKlok = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const klokID = req.body.klokkieID
                const klok = await Klok.findOne({_id: klokID})
                if (klok) {
                    klok.user = req.body.user,
                    klok.project = req.body.project,
                    klok.date = req.body.date,
                    klok.description = req.body.description,
                    klok.hours = req.body.hours
                    await klok.save()

                    const klokIndex = admin.kloks.findIndex(k => k._id.toString() === klokID);
                    admin.kloks[klokIndex] = klok;
                    await admin.save();

                    const user = await User.findOne({ fullname: req.body.user })
                    const klokIndexUser = user.kloks.findIndex(k => k._id.toString() === klokID);
                    user.kloks[klokIndexUser] = klok;
                    await user.save();
                }
                res.redirect(`/admin/home/${admin.id}`)
            } else {
                return res.send("Admin not found")
            } 
    } catch (error) {
        console.error(error)
        }
    } else {
    res.send("error: no access granted")
    }
}

const deleteKlok = async (req, res) => {
    const token = req.cookies.admintoken
    if (token) {
        try {
            const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
            const adminID = decodedToken.userId
            const admin = await Admin.findOne({ _id: adminID })
            if (admin) {
                const klokID = req.body.klokkieID;
                const klok = await Klok.findOne({ _id: klokID });
                if (klok) {
                    const user = await User.findOne({ fullname: klok.user });
                    user.kloks.pull(klok._id);
                    await user.save();
                    admin.kloks.pull(klok._id);
                    await admin.save();
                    await Klok.deleteOne({ _id: klok._id });
                    res.redirect(`/admin/home/${admin.id}`)
                } else {
                    res.send("klok not found")
                }
            } else {
                return res.send("Admin not found")
            }
        } catch (error) {
            console.error(error)
        }
    } else   {
        res.send("error: no access granted") 
    } 
}


module.exports = {
    createUser,
    createProject,
    findAllUsers,
    findAllProjects,
    updateUser,
    updateProject,
    deleteUser,
    deleteProject,
    adminLogin,
    adminLogout,
    sendLoginForm,
    sendNewAdminForm,
    createNewAdmin,
    adminHome,
    updateKlok,
    deleteKlok,
    createKlok
}