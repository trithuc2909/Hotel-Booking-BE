import { Router } from "express";
import * as serviceController from "../../controllers/service.controller";
import {
  getAdminServicesValidation,
  createServiceValidation,
  updateServiceValidation,
  updateServiceStatusValidation,
  handleValidationErrors,
  validateId,
} from "../../middleware/validation";
import { uploadServiceImage } from "../../middleware/upload.middleware";
const router = Router();
router.get("/stats", serviceController.getServiceStats);
router.get(
  "/",
  getAdminServicesValidation,
  handleValidationErrors,
  serviceController.getAdminServices,
);

router.post(
  "/",
  uploadServiceImage,
  createServiceValidation,
  handleValidationErrors,
  serviceController.createService,
);

router.patch(
  "/:id/status",
  validateId,
  updateServiceStatusValidation,
  handleValidationErrors,
  serviceController.updateServiceStatus,
);

router.patch(
  "/:id",
  validateId,
  uploadServiceImage,
  updateServiceValidation,
  handleValidationErrors,
  serviceController.updateService,
);

router.get(
  "/:id",
  validateId,
  handleValidationErrors,
  serviceController.getAdminServiceById,
);

router.delete(
  "/:id",
  validateId,
  handleValidationErrors,
  serviceController.deleteService,
);
export default router;
