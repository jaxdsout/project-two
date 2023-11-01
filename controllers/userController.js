const { User, Klok, Admin, Project } = require('../models/admin');

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const { JWT_KEY_SECRET } = require("../config");


// LOGIN - GET
const sendPINForm = async (req, res) => {
    let entryAccess = false;
    const token = req.cookies.usertoken
    if(token) {
        entryAccess = true
        const decodedToken = jwt.verify(token, JWT_KEY_SECRET)
        const userID = decodedToken.userId
        const user = await User.findOne({ _id: userID })
        res.redirect(`/user/home/${user.id}`)
    } 
    res.render('user/login.ejs', {entryAccess}) 
}

// LOGIN - POST 
const userLogin = async (req, res) => {
    try{
        if (req.body.PIN) {
            if (req.body.PIN.length === 5) {
                const user = await User.findOne({ PIN: req.body.PIN })
                if (!user) {
                    return res.send("no user found")
                }
                const verify = bcrypt.compare(req.body.PIN, user.PIN);
                if (!verify) {
                    return res.send("invalid PIN")
                }
                const token = jwt.sign(
                    { userId: user.id, PIN: user.PIN },
                    JWT_KEY_SECRET,
                    // { expiresIn: '1hr' }
                );
                return res.cookie('usertoken', token).redirect(`/user/home/${user._id}`)
            } else {
                return res.send('PIN must be 5 digits long')
            }
        } else {
            return res.send('PIN is required ')
        }
    } catch (error) {
        console.error(error)
    }
}

// LOGOUT
const userLogout = (req, res, next) => {
    if(!req.cookies.usertoken) {
        return res.send('Failed to logout')
    }
    try {
        const data = jwt.verify(req.cookies.usertoken, JWT_KEY_SECRET)
        console.log("Logging out now", data)
        return res.clearCookie('usertoken').redirect('/user/login');
    } catch (error) {
        console.error(error)
    }

}

// USER HOME PAGE
const userHome = async (req, res) => {
    let entryAccess = false;
    if (req.cookies.usertoken) {
        entryAccess = true
        const user = await User.findOne({ _id: req.params.id})
        const kloks = user.kloks
        const availProj = await Admin.findOne({_id: user.admin._id})
        const projects = availProj.projects
        res.render("user/user.ejs", { user, kloks, projects, entryAccess });
        } else {
            res.send("error: no access granted").redirect('/user/login');
        }
}

// CREATE KLOK

const createKlok = async (req, res) => {
    if (req.cookies.usertoken) {
        const user = await User.findById(req.params.id);
        const adminID = user.admin
        const admin = await Admin.findById(adminID)
        const klok = await Klok.create({
            user: user.fullname,
            project: req.body.project,
            date: req.body.date,
            description: req.body.description,
            hours: req.body.hours
        })
        if (admin) {
            admin.kloks.push(klok)
            await admin.save()
        }
        if (user) {
            user.kloks.push(klok);
            await user.save();
            res.redirect(`/user/home/${user._id}`);
          } 
    } else {
        res.send("error: no access granted")
    }
};
  

module.exports = {
    sendPINForm,
    userLogin,
    userLogout,
    userHome,
    createKlok
}