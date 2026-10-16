import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
const registerUser = asyncHandler(async (req,res)=>{
 

    const {fullName, email , username, password} = req.body;
    console.log("email:", email)

    if(
        [fullName, email , username, password].some((field)=>
        field?.trim()=== "" )
    
    ){
        throw new ApiError(400,"All fields are required")
        
    }
   const existedUser= await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or name already exists")
    }




console.log("REQ.FILES =", req.files);


    const avatarLocalPath = req.files?.avatar?.[0]?.path;
const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
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
    username: username.toLowerCase()
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

// const generateAccessAndRefreshTokens = async(userId) =>{
//     try {
//         const user = await User.findById(userId)
//         const accessToken = user.generateAccessToken()
//         const refreshToken = user.generateRefreshToken()

//         user.refreshToken = refreshToken
//         await user.save({ validateBeforeSave: false })

//         return {accessToken, refreshToken}


//     } catch (error) {
//         throw new ApiError(500, "Something went wrong while generating refresh and access token")
//     }
// }
//gpt
const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error("User not found in database");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("TOKEN GENERATION ERROR:", error);

        throw new ApiError(
            500,
            error.message || "Something went wrong while generating tokens"
        );
    }
};


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "User doesn't exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await  generateAccessAndRefreshTokens(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        );
});
const logoutUser = asyncHandler(async(req,res)=>{
      
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }},
            {
                new : true
            },
) 

const options = {
        httpOnly: true,
        secure: true
    };

   return res.status(200).
   clearCookie("accessToken" , options)
   clearCookie("refreshToken" , options).
   json(new ApiResponse (200, {}, " User Loggged "))
})


    const refreshAccessToken = asyncHandler(async(req,res)=>{
        try {
    const incomingRefreshToken =   req.body.refreshToken || req.cookies?.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }
    const decodedToken= 
    jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

   const user = await User.findById(decodedToken?._id);

   if(!user){
    throw new ApiError(401, "Invalid Refresh Token")
   }

   if(incomingRefreshToken!== user?.refreshToken){
    throw new ApiError(401, "Refresh token Expired ")
   }
const options = {
        httpOnly: true,
        secure: true
    };

   const {accessToken,refreshToken}= await generateAccessAndRefreshTokens(user._id);

    return 
    res.status(200).
    cookie("accessToken", accessToken, options).
    cookie("refreshToken", refreshToken, options).
    json(new ApiResponse (200,{
        accessToken, refreshToken:
        newRefreshToken 
    },"Access Token Refreshedd")  )
        }
catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token Error")
}})
export { registerUser, loginUser ,logoutUser, refreshAccessToken};