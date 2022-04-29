const nodemailer = require('nodemailer');
const userModel = require('../model/userModel');
const addressModel = require('../model/addressModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const commonFunction = require('../helper/commonFunction');
const { response } = require("express");
const { Schema } = require('mongoose');
const qrCode = require('qrcode');

module.exports = {

    /* 2. Create an API for SignUp */
    signUp: async (req, res) => {
        try {
            let result = await userModel.findOne({ email: req.body.email, status: { $ne: 'DELETE' } })
            if (result) {
                return res.send({ ressponseCode: 409, ResponseMessage: "Email Already Exist.", result: [] })
            }
            else {
                req.body.otp = commonFunction.generateOTP();
                req.body.otpExpireTime = Date.now() + (3 * 60 * 1000);
                let password = req.body.password;
                let conpass = req.body.confirmPassword
                if (password != conpass) {
                    res.send({ reponseCode: 401, responseMessage: 'Password do not match.', })
                }
                req.body.password = bcrypt.hashSync(password)
                req.body.password = bcrypt.hashSync(conpass)
                let subject = 'signUP OTP';
                let text = `Your OTP : ${req.body.otp}`;
                let mail = await commonFunction.sendMail(req.body.email, subject, text,)
                if (!mail) {

                    return res.send({ reponseCode: 500, responseMessage: 'Internal Server Error.', result: [], })
                }
                else {
                    let userSave = await new userModel(req.body).save()
                    if (!userSave) {
                        return res.send({ reponseCode: 500, responseMessage: 'Internal Server Error.', result: [], })
                    } else {
                        return res.send({ reponseCode: 200, responseMessage: 'SignUp Done Successfully.', responseResult: userSave },);
                    }
                }
            }
        }
        catch (error) {
            return res.send({ reponseCode: 501, responseMessage: 'Something went worng, please try again', result: error.message })
        }
    },


    signUp: (req, res) => {
        try {
            userModel.findOne({
                email: req.body.email, status: { $ne: 'DELETE' }, userType: 'USER'
            },
                (error, result) => {
                    if (error) {
                        return res.send({
                            responseCode: 200,
                            responseMessage: "Signup successful",
                            responseResult: sRes,
                        });
                    } else if (result) {
                        return res.send({
                            responseCode: 409,
                            responseMessage: "User already exist",
                            responseResult: result,
                        });
                    } else {
                        req.body.otp = commonFunction.generateOTP();
                        req.body.otpExpireTime = Date.now() + 5 * 60 * 1000;
                        req.body.password = bcrypt.hashSync(req.body.password);
                        let subject = "SIGN up OTP";
                        let text = `Your OTP: ${req.body.otp}`;
                        // commonFunction.sendMail(req.body.email, subject, text, (mErr, mRes) => {
                        //   if (mErr) {
                        //   } else {
                        userModel(req.body).save(async (sErr, sRes) => {
                            if (sErr) { } else {
                                req.body.userId = sRes._id;
                                let saveAddress = await addressModel(req.body).save();
                                if (saveAddress) {
                                    let updateUser = await userModel.findByIdAndUpdate(
                                        { _id: sRes._id },
                                        { $set: { addressId: saveAddress._id } },
                                        { new: true });
                                }
                                return res.send({
                                    responseCode: 200,
                                    responseMessage: "Signup successful",
                                    responseResult: sRes,
                                });
                            }
                        });
                    }
                });
        } catch (e) {
            console.log(e)
        }

    },

    /* 3. Create an API for OTP Verification */
    otpVerify: async (req, res) => {
        try {
            let resultVerify = await userModel.findOne(
                {
                    $and: [{

                        $or: [
                            {
                                email: req.body.email
                            }
                        ],
                    },
                    { status: { $ne: "DELETE" } },
                    ],
                })
            if (!resultVerify) {
                return res.send({
                    reponseCode: 401,
                    responseMessage: 'User not found',
                    responseResult: []
                });
            } else {
                if (resultVerify.otpVerify == true) {
                    return res.send({
                        responseCode: 409,
                        responseMessage: 'User already verified.',
                        responseResult: resultVerify
                    })
                } else {
                    let currentTime = Date.now();
                    if (req.body.otp == resultVerify.otp) {
                        if (resultVerify.otpExpireTime >= currentTime) {
                            let resVerify = await userModel.findByIdAndUpdate({
                                _id: resultVerify._id
                            }, {
                                $set: {
                                    otpVerify: true
                                }
                            }, {
                                new: true
                            })
                            if (!resVerify) {
                                return res.send({
                                    reponseCode: 500,
                                    responseMessage: 'Internal Server Error.',
                                    result: []
                                });
                            } else {
                                return res.send({
                                    reponseCode: 200,
                                    responseMessage: 'User verified successfully !!!',
                                    result: []
                                });
                            }

                        } else {
                            return res.send({
                                reponseCode: 410,
                                responseMessage: 'OTP Expired',
                                result: []
                            });
                        }
                    } else {
                        return res.send({
                            reponseCode: 400,
                            responseMessage: 'Wrong OTP Entered.',
                            result: []
                        });
                    }

                }
            }
        } catch (er) {
            return res.send({
                reponseCode: 501,
                responseMessage: 'Something went worng.',
                result: er.message
            })
        }
    },

    /*4. Resend OTP API*/

    resendOtp: async (req, res) => {
        try {
            let query = {
                $and: [{
                    $or: [{
                        email: req.body.email
                    },],
                }, {
                    status: {
                        $ne: "DELETE"
                    }
                },],
            };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({
                    reponseCode: 404,
                    responseMessage: 'User Not Found .',
                    responseResult: [],
                });
            } else {
                let otp = commonFunction.generateOTP();
                let expireTime = Date.now() + (5 * 60 * 1000);
                let subject = 'OTP for verify';
                let text = `${otp}`;
                let mailResult = await commonFunction.sendMail(userResult.eamil, subject, text);
                if (mailResult) {
                    let updateUser = await userModel.findByIdAndUpdate({
                        _id: userResult._id
                    }, {
                        $set: {
                            otpVerify: false,
                            otp: otp,
                            otpExpireTime: expireTime
                        }
                    }, {
                        new: true
                    })
                    if (updateUser) {
                        return res.send({
                            reponseCode: 200,
                            responseMessage: 'OTP Sent Successfully .',
                            responseResult: updateUser,
                        });
                    }
                }
            }
        } catch (error) {
            return res.send({
                reponseCode: 501,
                responseMessage: 'Something went wrong, please try again .',
                responseResult: error.message,
            });
        }
    },

    /* 5. Create an API for Forgot Password */

    forgotPassword: async (req, res) => {
        try {
            let query = {
                $and: [{
                    $or: [{
                        email: req.body.email
                    }, {
                        mobileNumber: req.body.mobileNumber
                    },],
                }, {
                    status: {
                        $ne: "DELETE"
                    }
                }, {
                    userType: 'USER'
                }],
            };

            let user = await userModel.findOne(query);


            if (!user) {
                return res.send({
                    reponseCode: 404,
                    responseMessage: 'User Not Found .',
                    responseResult: []
                });
            } else {
                let otp = commonFunction.generateOTP();
                let expireTime = Date.now() + (5 * 60 * 1000);
                let subject = 'OTP verification for forgot password!';
                let text = `Your otp for verification:${otp}`;
                let mailResult = await commonFunction.sendMail(req.body.email, subject, text);
                if (mailResult) {

                    let otpUpdate = await userModel.findOneAndUpdate({
                        _id: user._id
                    }, {
                        $set: {
                            otpVerify: false,
                            otp: otp,
                            otpExpireTime: expireTime
                        }
                    }, {
                        new: true
                    })
                    if (otpUpdate) {
                        return res.send({
                            reponseCode: 200,
                            responseMessage: 'OTP Password Forgot Successfully .',
                            responseResult: otpUpdate
                        });
                    }
                }
            }
        } catch (error) {
            return res.send({
                reponseCode: 501,
                responseMessage: 'Something went wrong, please try again .',
                responseResult: error.message,
            });
        }
    },

    /* 6. Create an API for Reset Password */

    resetPassword: async (req, res) => {
        try {
            let query = {
                $and: [{
                    $or: [{
                        email: req.body.email
                    }, {
                        mobileNumber: req.body.mobileNumber
                    },],
                }, {
                    status: {
                        $ne: "DELETE"
                    }
                }, {
                    userType: 'USER'
                }],
            };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({
                    reponseCode: 404,
                    responseMessage: 'User Not Found .',
                    responseResult: []
                });
            } else {

                let password = req.body.password;
                let conpass = req.body.confirmPassword

                if (password != conpass) {
                    res.send({
                        reponseCode: 401,
                        responseMessage: 'Password do not match, please write correct password.',
                    })
                }
                req.body.password = bcrypt.hashSync(password)

                let otp = commonFunction.generateOTP();
                let expireTime = Date.now() + (5 * 60 * 1000);

                let subject = 'OTP verification for reset password!';
                let text = `Your otp for verification:${otp}`;
                let mailResult = await commonFunction.sendMail(req.body.email, subject, text);
                if (mailResult) {

                    let userUpdate = await userModel.findOneAndUpdate({
                        _id: userResult._id
                    }, {
                        $set: {
                            otpVerify: false,
                            otp: otp,
                            otpExpireTime: expireTime
                        }
                    }, {
                        new: true
                    })
                    if (userUpdate) {
                        return res.send({
                            reponseCode: 200,
                            responseMessage: 'Password Reset Successfully .',
                            responseResult: userUpdate
                        });
                    }
                }
            }
        } catch (error) {
            return res.send({
                reponseCode: 501,
                responseMessage: 'Something went wrong .',
                responseResult: error.message,
            });
        }
    },

    /*8. Create an API for Login */

    login: async (req, res) => {
        try {
            let query = {
                $and: [{
                    email: req.body.email
                }, {
                    status: {
                        $ne: "DELETE"
                    }
                }, {
                    userType: 'USER'
                }],
            };
            let userResult = await userModel.findOne(query);
            if (!userResult) {
                return res.send({
                    reponseCode: 404,
                    responseMessage: 'User Not Found.',
                    responseResult: [],
                });
            } else {
                if (userResult.otpVerify == false) {
                    return res.send({
                        reponseCode: 401,
                        responseMessage: 'User Not Verified',
                        responseResult: []
                    });
                } else {
                    if (req.body.email != userResult.email) {
                        return res.send({
                            reponseCode: 401,
                            responseMessage: 'Incorrect EmailId.',
                        })
                    } else {
                        let passCheck = bcrypt.compareSync(req.body.password, userResult.password);
                        if (passCheck == false) {
                            return res.send({
                                reponseCode: 401,
                                responseMessage: 'Incorrect password.',
                            })
                        } else {
                            /* API for User Authentication*/
                            let data = {
                                userId: userResult._id,
                                email: userResult.email
                            }
                            let token = jwt.sign(data, 'test', { expiresIn: '1h' })
                            console.log("442====>", data);
                            return res.send({
                                reponseCode: 200,
                                responseMessage: 'Login Done Successfully !!!',
                                responseResult: token
                            });
                        }
                    }
                }
            }
        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Something went wrong, please try again!",
                responseResult: error.message,
            });
        }
    },

    /* 9. Create an API for Edit Profile */
    editProfile: async (req, res) => {
        try {
            let query1 = {
                $and: [{
                    $or: [{
                        _id: req.body._id
                    },

                    {
                        mobileNumber: req.body.mobileNumber
                    },
                    ],
                },
                {
                    status: {
                        $ne: "DELETE"
                    }
                },
                {
                    userType: 'USER'
                }
                ],
            };
            let userResult = await userModel.findOne(query1);
            if (!userResult) {
                return res.send({
                    reponseCode: 404,
                    responseMessage: 'User Not Found .',
                    responseResult: []
                });
            } else {
                let query2 = {
                    $and: [{
                        $or: [{
                            email: req.body.email
                        },
                        {
                            mobileNumber: req.body.mobileNumber
                        },
                        ],
                    },
                    {
                        status: {
                            $ne: "DELETE"
                        }
                    },
                    {
                        userType: 'USER'
                    },
                    {
                        _id: {
                            $ne: userResult._id
                        }
                    }
                    ],
                };
                let usercheck = await userModel.findOne(query2);
                if (!usercheck) {
                    let updateUser = await userModel.findByIdAndUpdate({
                        _id: userResult._id
                    }, {
                        $set: req.body
                    }, {
                        new: true
                    })
                    if (updateUser) {
                        return res.send({
                            reponseCode: 200,
                            responseMessage: 'your Profile has been updated Successfully .',
                            responseResult: updateUser,
                        });
                    } else {
                        if (req.body.email == usercheck.email) {
                            return res.send({
                                responseCode: 409,
                                responseMessage: 'Email is already used!.',
                                responseResult: resultVerify
                            })
                        }
                    }
                }
            }

        } catch (error) {
            return res.send({
                responseCode: 501,
                responseMessage: "Something went wrong, please try again!",
                responseResult: error.message,

            });
        }
    },

    /* Create an API for List User */

    listUser: async (req, res) => {
        try {
            let query = {
                status: {
                    $ne: "DELETE"
                },
                userType: "USER"
            };
            if (req.body.search) {
                query.$or = [{
                    firstName: {
                        $regex: req.query.search,
                        $options: 'i'
                    }
                },
                {
                    email: {
                        $regex: req.query.search,
                        $options: 'i'
                    }
                },
                ]

            }

            let options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sort: {
                    createdAt: -1
                },
                populate: 'addressId'
            };
            let userData = await userModel.paginate(query, options);
            console.log(userData);
            if (userData.docs.length == 0) {
                res.send({
                    reponseCode: 404,
                    responseMessage: 'User Data Not Found.',
                    responseResult: [],
                });

            } else {
                console.log(userData);
                res.send({
                    reponseCode: 200,
                    responseMessage: 'User Data Found !!!',
                    responseResult: userData
                });
            }
        } catch (error) {
            return res.send({
                responseCode: 500,
                responseMessage: "Something went wrong, please try again!",
                responseResult: error.message,
            });

        }
    },


    viewUser: async (req, res) => {
        try {
            console.log(req.userId)
            let query = { _id: req.userId, status: 'ACTIVE', userType: "USER" };
            let usersData = await userModel.findOne(query);
            console.log(usersData)
            if (!usersData) {
                res.send({ responseCode: 404, responseResult: [] })
            } else {
                res.send({ responseCode: 200, responseResult: usersData })
            }
        } catch (error) {
            console.log("501 ==>", error);
            return res.send({
                responseCode: 501,
                responseMessage: "Something Went Wrong!",
                responseResult: error.message,

            });
        }
    },

    // Upload multiple file
    uploadImage: async (req, res) => {
        try {
            let image = [];
            console.log(req.files)
            for (let index = 0; index < req.files.length; index++) {
                let f = await commonFunction.uploadImage(req.files[index].path);
                image.push(f);
            }
            if (image.length != 0) {
                return res.send({ reponseCode: 200, responseMessage: 'Image Uploaded successfully !', responseResult: image });
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },


    // qrCodeGenerator: async (req, res) => {
    //     const Schema = {
    //         email: Joi.string().email({ minDomaininSegments: 2, tlds: { allow: ["com", "net"] } }).required(),
    //     }
    //     try {
    //         let validateBody = await Joi.validate(req.body, Schema)
    //         const result = await userModel.findOne({ email: validateBody.email }, { status: "ACTIVE" }, { userType: "USER" })

    //         if (!result) {
    //             res.send({ responseCode: 404, responseResult: "User Not Exist.", responseResult: result })
    //         } else {
    //             let data = JSON.stringify(result);
    //             qr.toString(data, { userType: "USER" })
    //             let qrCode = await qr.toDataURL("Hii Taufeeque")
    //             res.send({ responseCode: 200, responseMessage: "QRCode Generated.", responseResult: qrCode });
    //         }
    //     } catch (error) {
    //         res.send({ responseCode: 501, responseMessage: "Something Went Wrong.", responseResult: error })
    //     }
    // },

    qrCodeGenerator: async (req, res) => {
        try {
            let qr = await qrCode.toDataURL(text = 'https://res.cloudinary.com/taufeeque/image/upload/v1650537132/bmjnzfomlogccqhbarc7.jpg')        // you can give here some text and some image path 
            // /let qr = await qrCode.toString(text = 'Hii Taufeeque Alam')
            console.log(qr);
            if (qr) {
                return res.send({ reponseCode: 200, responseMessage: ' QR Code Generated successfully !', responseResult: qr });
            }
        } catch (error) {
            return res.send({ responseCode: 501, responseMessage: "Something went wrong !", responseResult: error.message, });
        }
    },

};