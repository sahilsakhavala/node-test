import { UserSession } from "../models/usersession.model.js";

async function createDeleteOtherUserSessions(userId, role, currentToken) {
    try {
        const currentUserSession = await UserSession.findOne({ token: currentToken });
        const userSession = await UserSession.deleteMany({ user_id: userId, role: role, token: { $ne: currentUserSession.token } });
        return { success: true, message: "Other user sessions deleted successfully" };
    } catch (error) {
        console.error("Error deleting other user sessions:", error);
        return { success: false, message: "Failed to delete other user sessions" };
    }

}

export {
    createDeleteOtherUserSessions
}