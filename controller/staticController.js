const res = require('express/lib/response');
 const staticModel = require('../model/staticModel')
module.exports = {
    /* 10. Create an API for User List to fetch all records from the database which have user Type USER*/
    userList: async (req, res) => {
        try {
            let query = { $and: [{ status: 'ACTIVE' }, { userType: 'USER' }], };
            // let query = { $and: [{type: req.params.type},{ status: 'ACTIVE'}, { userType: 'USER' }], };
            let staticData = await staticModel.find(query);
            if (staticData.length != 0) {
                res.send({ responseCode: 200, responseMessage: 'All records are fetched from the Database..!!', responseResult: staticData })
            }
            else {
                res.send({ responseCode: 404, responseMessage: 'Sorry!! Static data not found!', responseResult: [] })
            }
        } catch (error) {
            res.send({ responseCode: 501, responseMessage: 'Something went wrong, please try again!', responseResult: error.message })
        }
    },

    /* 11. Create an API for viewUser*/
    viewUser: async (req, res) => {
        try {
            let query = { _id: req.params._id, status: 'ACTIVE' }
            // let query = { $and: [{ $or: [{ email: req.query.email },{_id: req.query._id},{mobileNumber: req.query.mobileNumber}] }, { status: { $ne: "DELETE" } },], }
            //let query = { $and: [{ $or: [{ email: req.params.email }, { _id: req.params._id }, { mobileNumber: req.params.mobileNumber }] }, { status: { $ne: "DELETE" } },], }

            let staticData = await staticModel.find(query);
            if (staticData.length != 0) {
                res.send({ responseCode: 200, responseMessage: 'Static data found!', responseResult: staticData })
            }
            else {
                res.send({ responseCode: 404, responseMessage: 'Sorry!! Static data not found!', responseResult: [] })
            }
        } catch (error) {
            console.log('viewUser ==>', error);
            res.send({ responseCode: 501, responseMessage: 'Something went wrong, please try again !', responseResult: error.message })
        }
    },

    /* 13. Create an API for staticList*/
    staticList: async (req, res) => {
        try {
            // let query = { type: req.params.type, status: 'ACTIVE' }
            let query = { status: "ACTIVE"};

            /* Pagination*/
            let options = {
                page: parseInt(req.query.page) || 1,
                limit: parseInt(req.query.limit) || 10,
                sort:{createdAt:-1}
            }
            
            
        // fromDate = 01/01/2021, to Date = ' '
            if(req.query.fromDate){
                query.createdAt = {$gte: req.body.fromDate}
            }

            // fromDate = ' ', to Date = 01/04/2022
            if(req.query.toDate){
                query.createdAt = {$lte: req.body.fromDate}
            }
            // fromDate = 01/01/2021, to Date = 01/04/2022

            if(req.query.fromDate && eq.query.toDate){
                query.$and[{createdAt: {$gte: req.body.fromDate}},{createdAt:{$lte: req.body.toDate}}]
            }
            let staticData = await staticModel.paginate(query,options);
            console.log(staticData);
            


            //let staticData = await staticModel.find(query);
            if (staticData.docs.length != 0) {
                res.send({ responseCode: 200, responseMessage: 'Static data found!', responseResult: staticData })
            }
            else {
                res.send({ responseCode: 404, responseMessage: 'Sorry!! Static data not found!', responseResult: [] })
            }
        } catch (error) {
            console.log('staticList ==>', error);
            res.send({ responseCode: 501, responseMessage: 'Something went wrong, please try again !', responseResult: error.message })
        }
    },

    /* 14. Create an API for viewStatic */
    viewStatic: async (req, res) => {
        try {
            let query = { type: req.query.type, status: 'ACTIVE' }
            //let query = { type: req.params.type, status: 'ACTIVE' }
            let staticData = await staticModel.find(query);
            if (staticData.length != 0) {
                res.send({ responseCode: 200, responseMessage: 'Static data found!', responseResult: staticData })
            }
            else {
                res.send({ responseCode: 404, responseMessage: 'Static data not found!', responseResult: [] })
            }
        } catch (error) {
            console.log('ViewStatic ==>', error);
            res.send({ responseCode: 501, responseMessage: 'Something went wrong, please try again!', responseResult: error.message })
        }
    },

   

};

