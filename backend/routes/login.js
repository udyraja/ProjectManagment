const express= require ('express');
const router = express.Router();
const mongoose =require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Login = require('../models/users');

router.post('/signup',(req,res,next)=> {
    Login.find({Email:req.body.Email})
        .exec()
        .then(login =>{
            if(login.length>=1){
                return  res.status(409).json({
                   message:'Mail Exists'
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    }else{
                        const login = new Login({
                            _id: new mongoose.Types.ObjectId(),
                            username: req.body.username,
                            Email: req.body.Email,
                            password:hash
                        });
                        login.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message:'User Created'
                                });
                            })
                            .catch(err => {
                                console.log(err);
                                res.status(500).json({
                                    error:err
                                });
                            } );
                    }

                })
            }
        })

});
router.post('/login',(req,res,next)=> {
    Login.find({Email:req.body.Email})
        .exec()
        .then(Users =>{
            if(Users.length <1){
                return  res.status(401).json({
                    message:'failed'
                });
            }
            bcrypt.compare(req.body.password,Users[0].password,(err, result) => {
                    if (err) {
                        return res.status(401).json({
                            message:'failed'
                        });
                    }
                    if(result){
                         const token = jwt.sign({
                                 Email:Users[0].Email,
                             username:Users[0].username,
                             Id:Users[0]._id
                        },
                             process.env.JWT_KEY,
                             {
                                expiresIn:"1h"
                             });
                        return res.status(200).json({
                            message:'Success',
                           token:token
                        });
                    }
                    res.status(401).json({
                        message: 'Failed'
                    });
                });
        })
        .catch(err => {
        console.log(err);
        res.status(500).json({error : err});
    });
});

module.exports =router;