const mongoose = require("../db/connection");

const ProjSchema = new mongoose.Schema({
    name: String,
    location: String,
    active: Boolean,
    projectType: String,
    startDate: String,
    generalContractor: String
    // users: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User'
    // }],
})

const Project = mongoose.model("Project", ProjSchema)

module.exports = Project