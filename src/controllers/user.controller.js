import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async (req, res) => {
   // get user details from frontend threw POSTMAN
   // validation - data not empty
   // check if user already exist or not. check    username, email.
   // check for images, check for avatar
   // upload image & avatar to cloudinary 
   // create user object - create entry in DB
   // remove password and refresh token field from response
   // check for user creation
   // return response


   const {fullName, email, username, password} = req.body
   console.log("email:", email);
//    console.log("fullName : ", fullName);
//    console.log("username",username);
//    console.log("password", password);

   // validation - data not empty
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are  required")
    } 
    
    // here we check if user already available then send a error msg.

    const existedUser = User.findOne ({
        $or: [{username}, {email}]
    })

    if (existedUser) {
        throw new ApiError(409, "User email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

export {registerUser}