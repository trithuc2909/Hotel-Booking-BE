import * as promotionDb from "../db/promotion.db";

export const getAllPromotions = async () => {
  return promotionDb.findAllPromotions();
};