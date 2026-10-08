import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message: "ok"
    })

    const {fullName, email , userName, password} = req.body;
    console.log("email:", email)

    if(
        [fullName, email , userName, password].some((field)=>
        field?.trim()=== "" )
    
    ){
        throw new ApiError(400,"All fields are required")
        
    }
   const existedUser= await User.findOne({
        $or: [{userName},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or name already exists")
    }





    const avatarLocalPath = req.files?.avatar[0].path ;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if(!avatarLocalPath){
        throw new ApiError(400 , "Avatar File is Required!!")
    
    }
   const avatar= await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImageLocalPath);

   if(!avatar){
    throw new ApiError(400 , "Avatar File is Required!!");
   }

   //dB
   const user=await User.create({
    fullName,
   avatar : avatar.url,
    password,
    email,
    coverImage: coverImage?.url || "",
    userName:userName.toLowerCase()
   })
//select Specifies which document fields to include or exclude (also known as the query "projection")
   const createdUser= await User.findById(user._id).select("-password -refreshToken")


   if(!createdUser){
    throw new ApiError(500 , "Something went Wrong while registering!!");
   }
   return res.status(201).json(
    new ApiResponse(200, createdUser, "User Registered Successfully!!")
   )
})



export { registerUser }