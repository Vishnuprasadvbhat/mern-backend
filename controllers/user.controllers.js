import UserModel from "../models.js/user.model.js";

export const getUserData = async (req, res) => {
  try {
    const {userId} = req.body ;

    const user = await UserModel.findById(userId) ;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: user,
      userdata : {
        name : user.name,
        Isverified : user.isVerified
      }

    });
  }
  catch (error){
    return res.status(400).json({message: error.message});
  }
};