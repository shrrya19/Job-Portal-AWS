const authorizeRole = (...allowedRoles) => (req, res, next) => {
    if (!allowedRoles.includes(req.role)) {
        return res.status(403).json({
            message: "You are not authorized to perform this action.",
            success: false
        });
    }

    next();
};

export default authorizeRole;
