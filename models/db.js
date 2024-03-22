
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://saoooo2pro:saoooo2pro@databasenhom1.p8zny2e.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("CONNECT MONGODB ONLINE MD09");
    })
    .catch((err) => {
        console.log("error connecting to server");
        console.log(err);
    })

module.exports = { mongoose }
