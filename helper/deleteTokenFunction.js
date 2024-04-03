import { UserSession } from "../models/usersession.model.js";

function createDeleteOtherUserSessions(userId, role, currentToken) {
    return async function deleteOtherUserSessions() {
        try {
            const currentUserSession = await UserSession.findOne({ token: currentToken });
            if (!currentUserSession) {
                throw new Error("Current user session not found");
            }
            const userSession = await UserSession.deleteMany({ user_id: userId, role: role, token: { $ne: currentUserSession.token } });
            console.log(userSession);
            return { success: true, message: "Other user sessions deleted successfully" };
        } catch (error) {
            console.error("Error deleting other user sessions:", error);
            return { success: false, message: "Failed to delete other user sessions" };
        }
    }
}

export {
    createDeleteOtherUserSessions
}