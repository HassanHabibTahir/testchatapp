import { messageModal } from "../models/index.js";

export const updateOnlineMessages = async (data) => {
  try {
    if (data) {
      await messageModal.findByIdAndUpdate(
        data._id,
        { status: "seen" },
        { new: true }
      );
    }
  } catch (err) {}
};
