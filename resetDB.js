const { User, Project, Admin, Klok } = require('./models/admin')


Admin.deleteMany()
    .then(() => {
        return Admin.deleteMany();
    })
    .then(() => {
        return User.deleteMany();
    })
    .then(() => {
        return Project.deleteMany();
    })
    .then(() => {
        return Klok.deleteMany();
    })
    .then(() => {
        console.log('RESET ENTIRE DATABASE');
    })
    .catch((err) => {
        console.error('Error resetting the database:', err);
    });
