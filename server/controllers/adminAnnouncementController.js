import * as announcementService from "../services/adminAnnouncementService.js";

export const postAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, audience, start_date, expiry_date, is_pinned } = req.body;
    const insertId = await announcementService.createAnnouncementRecord(req.body);

    const newAnn = {
      id: insertId,
      title,
      content,
      category: category || 'Notice',
      audience: audience || 'All Students',
      start_date,
      expiry_date,
      is_pinned: is_pinned ? 1 : 0,
      created_at: new Date()
    };

    // Broadcast via Socket.IO based on audience
    if (audience && audience.toLowerCase().includes('student')) {
      req.io.to("students").emit("newAnnouncement", newAnn);
    } else if (audience && audience.toLowerCase().includes('company')) {
      req.io.to("companies").emit("newAnnouncement", newAnn);
    } else {
      req.io.to("students").to("companies").emit("newAnnouncement", newAnn);
    }

    res.json({ success: true, message: "Announcement posted", data: newAnn });
  } catch (err) { next(err); }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    await announcementService.updateAnnouncementById(req.params.id, req.body);
    res.json({ success: true, message: "Announcement updated successfully" });
  } catch (err) { next(err); }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    await announcementService.deleteAnnouncementById(req.params.id);
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) { next(err); }
};
