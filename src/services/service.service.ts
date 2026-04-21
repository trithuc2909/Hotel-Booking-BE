import * as serviceDb from "../db/service.db";

export const getAllServices = async () => {
  return serviceDb.findAllServices();
};

export const getAllServiceCategories = async () => {
  return serviceDb.findAllServiceCategories();
};
