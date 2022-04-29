const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mongoosePaginate = require('mongoose-paginate');


/* 12. Default static content model creation */
const staticSchema = new Schema(
    {
        type: {
            type: String,
        },
        title: {
            type: String,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ["ACTIVE", "BLOCK", "DELETE"],
            default: "ACTIVE",
        },
        userType: {
            type: String,
            enum: ["ADMIN", "USER"],       
            default: "USER"
        },
    },
    { timestamps: true }
);


staticSchema.plugin(mongoosePaginate);  //For Pagination

let staticModel = mongoose.model("static", staticSchema);
module.exports = staticModel;

staticModel.find({ status: { $ne: "DELETE" } }, (staticErr, staticResult) => {
    if (staticErr) {
        console.log("Static query error:", staticErr);
    } else if (staticResult.length != 0) {
        console.log("Static content already exist.");
    } else {
        let obj1 = {
            type: "T&C",
            title: "Terms and Conditions",
            description:
                "You are winning. You simply cannot fail.The only obstacle is doubt, There is not a hill you cannot scale Once fear is put to rout.Do not think defeat, do not talk defeat, The word will rob you of your strength.“I will succeed,” This phrase repeat, Throughout the journey length.",

        };
        let obj2 = {
            type: "P&P",
            title: "Privacy  and Policy",
            description:
                "You are winning. You simply cannot fail.The only obstacle is doubt, There is not a hill you cannot scale Once fear is put to rout.Do not think defeat, do not talk defeat, The word will rob you of your strength.“I will succeed,” This phrase repeat, Throughout the journey length.",


        };
        let obj3 = {
            type: "AboutUs",
            title: "About Us",
            description:
                "You are winning. You simply cannot fail.The only obstacle is doubt, There is not a hill you cannot scale Once fear is put to rout.Do not think defeat, do not talk defeat, The word will rob you of your strength.“I will succeed,” This phrase repeat, Throughout the journey length."

        };
        staticModel.create(obj1, obj2, obj3, (createErr, createResult) => {
            if (createErr) {
                console.log("Static creation error:", createErr);
            } else {
                console.log("Static content created successfully!");
            }
        });
    }
});

