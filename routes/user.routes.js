import { Router } from "express";
import { registerUser , loginUser, logoutUser} from "../controllers/user.controller.js";
import {upload }from "../middlewares/multer.middleware.js"
import {jwtVerify} from "../middlewares/auth.middleware.js"
const router = Router();

router.route("/register").post(
    upload.fields([{
        name: "avatar",
        maxCount: 1
    },{
        name: "coverImage",
        maxCount:1
    }
]),
registerUser)


router.route("/login").post(loginUser)

//secured 
 router.route("/logout").post(jwtVerify, logoutUser)

export default router;

// import { Router } from "express";
// import { registerUser } from "../controllers/user.controller.js";
// import { upload } from "../middlewares/multer.middleware.js";

// const router = Router();

// router.route("/register").post(
//     upload.any(),
//     registerUser
// );

// export default router;