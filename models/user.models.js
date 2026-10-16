import mongoose, { Schema } from "mongoose";
import JWT from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "UserName is required"],
        unique: true,
        index: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: [true, "FullName is required"],
        
        index: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    avatar: {
        type: String, //cloudinary url
        required: true
    },
    coverImage: {
        type: String,
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    refreshToken: {
        type: String,
    }

}, {
    timestamps: true
})

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) return next();

//     this.password = await bcrypt.hash(this.password, 10)
  

// })   
//gpt

userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 10);
});




// it is the bycrpt method we have made this is password correct method 
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

//now we are using the jwt tokens for generating tokens and giving access

userSchema.methods.generateAccessToken = function () {
    return JWT.sign(
        {
            _id: this._id,
            email: this.email,
             fullName: this. fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return JWT.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

export const User = mongoose.model("User", userSchema);