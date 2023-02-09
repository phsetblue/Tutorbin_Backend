import express from "express";
import routeslogin from "./studentlogin.js";
import routesregister from "./studentregister.js";
import { studentController } from "../controller/index.js";
const router = express.Router();


// Middleware
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use("/student", routeslogin);
router.use("/student/register", routesregister);
router.post("/student/logout", studentController.logout);
router.get("/student/getinfo", studentController.getinfo);
router.post("/student/info", studentController.info);
// router.post("/tutor/register", tutorController.register);
// router.post("/tutor/login", tutorController.login);
// router.post("/tutor/logout", tutorController.logout);
// router.post("/question/ask", questionController.ask);
// router.post("/question/answer/:id", questionController.answer);
// router.post("/admin/register", adminController.register);
// router.post("/admin/login", adminController.login);
// router.post("/admin/logout", adminController.logout);


export default router;