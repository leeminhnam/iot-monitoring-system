const asyncHandler = require("../utils/asyncHandler");
const { getMeService } = require("../services/userService");

const getMe = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await getMeService(userId);

    return res.json({ data: user });
});

module.exports = { getMe };
