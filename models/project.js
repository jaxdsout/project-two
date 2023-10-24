const mongoose = require('mongoose')

const ProjSchema = new mongoose.Schema({
    name: String,
    location: String,
    projectID: String,
    startDate: String,
    active: String,
    projectType: String,
    workers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Project = mongoose.model("Project", ProjSchema)

module.exports = Project