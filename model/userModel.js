const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const mongoosePaginate = require("mongoose-paginate");


const userSchema = new Schema({
    firstName: {
        type: String
    },

    lastName: {
        type: String
    },

    email: {
        type: String
    },

    mobileNumber: {
        type: String
    },

    password: {
        type: String
    },

    address: {
        type: String
    },
    dateOfBirth: {
        type: Date
    },

    otp: {
        type: String
    },

    otpExpireTime: {
        type: Number
    },

    isOtpVerify: {
        type: Boolean,
        default: false,
    },



    /*For addressModel*/
    addressId:{
        type:Schema.Types.ObjectId,
        ref: 'address'
    },

    status: {
        type: String,
        enum: ["ACTIVE", "BLOCK", "DELETE"],
        default: "ACTIVE"
    },



    userType: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER"
    },

});
//module.exports = mongoose.model('user', userSchema);

userSchema.plugin(mongoosePaginate);  //For Pagination

let userModel= mongoose.model('user', userSchema);

/*1. Create a default admin in the user model*/
module.exports = userModel;
 
userModel.findOne(
 { status: { $ne: "DELETE" }, userType: "ADMIN" },
 (userErr, userRes) => {
   if (userErr) {
   } else if (userRes) {
     console.log("Default admin already exist");
   } else {
     let admin = {
       firstName: "Taufeeque",
       lastName: "Alam",
       email: "admin@indicchain.com",
       mobileNumber: 1234567890,
       password: bcrypt.hashSync("12345"),
       userType: "ADMIN",
       otpVerify: true,
     };
     userModel(admin).save((saveErr, saveAdmin) => {
       if (saveErr) {
       } else {
         console.log("Default admin created!");
       }
     });
   }
 }
);
 
