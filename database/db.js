const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/my_db', (err, res) => {
    if (err) {

        console.log("Oops! Database is not Connected.", err)
    } else {
        console.log("Database is connected Successfully !!!")

    }
})
