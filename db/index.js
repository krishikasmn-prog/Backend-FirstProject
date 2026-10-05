import mongoose from "mongoose";
import {db_Name} from "../src/constants.js";

const connectdB=(async ()=>{
    try{
       const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${db_Name}`)
       console.log(`\nMONGOOSE CONNECTED !! DB HOST ${connectionInstance.connection.host}`);

    }
    catch(error){
console.log(`Mongoose Connection Error:${error}`);
process.exit(1);
    }
})()

export default connectdB;