import express from "express";
import routeslogin from "./studentlogin.js";
import routesregister from "./studentregister.js";
import stquestion from "./question.js";
import { studentController, questionController } from "../controller/index.js";
const router = express.Router();




// Middleware
router.use(express.urlencoded({ extended: false }));
router.use(express.json());

router.use("/student/login", routeslogin);
router.use("/student/register", routesregister);
router.post("/student/logout", studentController.logout);
router.get("/student/getinfo", studentController.getinfo);
router.post("/student/setinfo", studentController.setinfo);
router.post("/student/changepassword", studentController.changepassword);
// router.post("/tutor/register", tutorController.register);
// router.post("/tutor/login", tutorController.login);
// router.post("/tutor/logout", tutorController.logout);

// router.post("/student/registerandask", studentController.regandask);
// router.post("/question/ask", upload.array('questionImage', 5), questionController.ask);
// router.post("/question/ask", questionController.ask);
router.use("/question", stquestion);

// router.post("/question/answer/:id", questionController.answer);
// router.post("/admin/register", adminController.register);
// router.post("/admin/login", adminController.login);
// router.post("/admin/logout", adminController.logout);


export default router;