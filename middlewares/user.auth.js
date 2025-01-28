import jwt from 'jsonwebtoken';


const userAuth = async (req, res, next) => {
  const {token} = req.cookies;

  if (!token) {
    return res.json({success :false, message:'Not Authorized. Login Again'});
  }

  try {
    const tokenDecoded = jwt.verify(token, process.env.SECRET_KEY);

    if (tokenDecoded.id) {
      req.body.userId = tokenDecoded.id
    }else {
      return res.json({success :false, message:'Not Authorized. Login Again'});
    }

    // It will run the further function in sequence
    next();// This will act as next phase after verifying the token
  }
  catch(error){
    res.status(500).json({sucess:false, message: error.message})
  }
};


export default userAuth;