const userRouter = require('express').Router();
const userController = require('../controller/userController');
const auth = require('../middleware/auth')

//const multer = require('multer');

// var upload = multer({dest:'imageUpload/'})

//const userModel = require('../model/userModel');
//const { route } = require('./staticRouter');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

userRouter.post("/signUp", userController.signUp);
userRouter.put("/otpVerify", userController.otpVerify);
userRouter.put("/resendOtp", userController.resendOtp);
// userRouter.put("/forgotPassword", userController.forgotPassword);
// userRouter.put("/resetPassword", userController.resetPassword);
userRouter.post("/login", userController.login);
// userRouter.put("/editProfile", userController.editProfile);

userRouter.get("/listUser",userController.listUser);

userRouter.get("/viewUser",auth.jwtToken,userController.viewUser);

userRouter.get("/uploadImage",upload.array('image',15),userController.uploadImage);

userRouter.get("/qrCodeGenerator",userController.qrCodeGenerator);

module.exports = userRouter;
