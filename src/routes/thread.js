// const express = require("express");
// const router = express.Router();
// const { roles } = require("../constants/commonConstants");
// const commonConstants = require("../constants/commonConstants");
// const { createThread, getUserThreads, getUserChats, getThreadById, getUnreadCountAtOnce } = require("../controllers/thread");
// const { authenticateUser } = require("../middlewares/authenticateUser");
// const { authorizeRoles } = require("../middlewares/authorizeRoles");
// const { validate } = require("../utils/validations/validate");
// const { createThreadValidator, paginationParametersValidator, getUserChatsValidator } = require("../validators/thread");
// const { authenticate } = require("../middlewares/authenticate");

// // only admins are allowed ------------------------

// // only users/taskers are allowed --------------------------

// router.post("/:serviceprovider", authenticateUser(), authorizeRoles([`${roles.USER}`]), createThreadValidator, validate, createThread);

// router.get("/", authenticate(), authorizeRoles([`${roles.USER}`, `${roles.SERVICE_PRO}`]), paginationParametersValidator, validate, getUserThreads);

// router.get("/unread", authenticate(), authorizeRoles([`${roles.USER}`, `${roles.SERVICE_PRO}`]), getUnreadCountAtOnce);

// router.get("/:thread", authenticate(), authorizeRoles([`${roles.USER}`, `${roles.SERVICE_PRO}`]), getUserChatsValidator, validate, getThreadById);

// router.get("/:thread/chats/user", authenticate(), authorizeRoles([`${roles.USER}`, `${roles.SERVICE_PRO}`]), getUserChatsValidator, validate, getUserChats);



// // allows any role ---------------------------------

// module.exports = router;