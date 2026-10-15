import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js"

export const jwtVerify = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.acccessToken || req.headers("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(400,"Unauthorized Access")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
       const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access Token")
    }
})