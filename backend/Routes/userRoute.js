import e from "express";
import { addAddress, authMiddleware, getUser, loginUser, registerUser, saveLocation } from "../Controller/userController.js";

const router=e.Router();

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post('/addaddress',authMiddleware,addAddress)
router.post('/savelocation',authMiddleware,saveLocation)
router.get('/getuser',authMiddleware,getUser)
export default router