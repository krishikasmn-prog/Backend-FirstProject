import mongoose from "mongoose";
import {db_Name} from "./constants.js";
import express from "express"
import dotenv from "dotenv"
import connectdB from "../db/index.js"
dotenv.config({
    path: '/.env'
})
connectdB;





// 1st method
// const app = express()

// (async () => {
//     try{
//        await mongoose.connect(`${process.env.MONGODB_URI}/${db_Name}`)
//        app.on("error",(error)=>{
//         console.log("ERROR:", error)
//         throw error
//        })
//        app.listen((process.env.PORT),()=>{
//         console.log(`App is listening on the Port ${process.env.PORT}`);
//        })
//     }
//     catch(error){
//         console.log(`Error:${error}`)
//         throw err
//     }
// })()