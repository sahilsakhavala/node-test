import mongoose from "mongoose";

const UserSessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    maxLength: 300
  },
  role: {
    type: String,
    enum: ['admin', 'company', 'hacker'],
    required: true
  },
  user_id: {
    type: String,
    required: true
  }

},
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }

  });

const UserSession = mongoose.model('usersessions', UserSessionSchema);

export {
  UserSession
};
