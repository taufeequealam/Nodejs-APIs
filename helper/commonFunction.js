const res = require('express/lib/response');
const nodemailer = require('nodemailer')
//const userModel = require('../model/userModel')

const cloudinary = require('cloudinary').v2;
cloudinary.config({
    cloud_name: 'taufeeque',
    api_key: '985756258458355',
    api_secret: 'n1cr3w9xNTpVS1z-0SnqkxyMuOQ',
    secure: true
});

module.exports = {
    generateOTP: () => {
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i <= 5; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    },
    sendMail: async (email, subject, text) => {
        try {
            let transporter = nodemailer.createTransport({
                service: "gmail",
                port: 587,
                secure: false,
                auth: {
                    user: "pqc-trainee@mobiloitte.com",
                    pass: "Mobiloitte1",
                },
            });
            let options = {
                from: "pqc-trainee@mobiloitte.com",
                to: 'mdalam.taufeeque@gmail.com',
                subject: "signUp and otp",
                text: text,
            }
            return await transporter.sendMail(options);
        } catch (error) {
            console.log('31 ==>', error)
        }

    },
    uploadImage : async (image) => {
        try {
            let upload = await cloudinary.uploader.upload(image);
            return upload.secure_url;
        } catch (error) {
            return res.send({responseCode: 501, responseMessage: "Something went wrong!, responseResult: error"});

        }

    },

};
