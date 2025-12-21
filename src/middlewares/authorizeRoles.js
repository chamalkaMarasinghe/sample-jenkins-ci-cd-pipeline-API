const AppError = require("../utils/errors/AppError");
const { catchAsync } = require("../utils/errors/catchAsync");
const {
  UnauthorizedError,
  InvalidRoleError,
  PermissionDeniedError,
} = require("../utils/errors/CustomErrors");

exports.authorizeRoles = (roles = []) => {
  return catchAsync(async (req, res, next) => {

    if(req.headers?.clientroute?.toString()?.split("/")?.[1] === "events"){      
      return next()
    }

    if (!Array.isArray(roles) || roles.length === 0) {
      return next(new PermissionDeniedError());
    }

    if (!req.user.roles) {
      return next(new PermissionDeniedError());
    }

    if (!req.user.roles || req.user.roles.length === 0) {
      return next(new PermissionDeniedError());
    }

    const isAuthorized = roles.some((role) => req.user.roles.includes(role));
    if (!isAuthorized) {
      return next(new PermissionDeniedError());
    }

    next();
  });
};
