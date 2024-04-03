import jwt from "jsonwebtoken";
import config from "../config/db.config.js";
import { UserSession } from "../models/usersession.model.js";
import { Admin } from "../models/admin.model.js";
import { Hacker } from "../models/hacker.model.js";
import { Company } from "../models/company.model.js";
import { verifyToken } from "../helper/jwtToken.js";

const userAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized!'
    });
  }
  var token = req.headers.authorization.split(' ')[1];
  try {
    const user = await verifyToken(token);
    const id = user.decoded.userId
    const checkAdmin = await Admin.findById(id);
    const checkCompany = await Hacker.findById(id);
    const checkHacker = await Company.findById(id);
    if (!checkAdmin && !checkCompany && !checkHacker) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized User!'
      })
    }
    const userSession = await UserSession.findOne({ token })
    if (!userSession) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized!'
      })
    }
    req.user = { id: user.userId, role: userSession.role, userSession_id: userSession._id };
    next();
  } catch (error) {
    console.log('error', error)
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized!'
    });
  }
}

export default userAuth;