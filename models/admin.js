const mongoose = require("mongoose");

const KlokSchema = new mongoose.Schema({
    project: String,
    date: { type: String, timestamps: true },
    description: String,
    hours: Number,
    user: String,
    
})

const UserSchema = new mongoose.Schema({
    username: String,
    fullname: String,
    PIN: String,
    startDate: String,
    position: String,
    hourlyPay: Number,
    admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
    },
    kloks: [KlokSchema]
})

const ProjectSchema = new mongoose.Schema({
    name: String,
    location: String,
    projectStart: String,
    active: String,
    projectType: String,
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
})

const AdminSchema = new mongoose.Schema({
    email: String,
    password: String,
    fullname: String,
    organization: String,
    users: [UserSchema],
    projects: [ProjectSchema],
    kloks: [KlokSchema]
})

const Project = mongoose.model("Project", ProjectSchema)

const User = mongoose.model("User", UserSchema)

const Admin = mongoose.model("Admin", AdminSchema)

const Klok = mongoose.model("Klok", KlokSchema)

module.exports = { Admin, User, Project, Klok }