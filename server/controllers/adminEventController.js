import * as eventService from "../services/eventService.js";

export const getAdminEvents = async (req, res, next) => {
  try {
    const data = await eventService.fetchAllEvents();
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const createEvent = async (req, res, next) => {
  try {
    await eventService.createEventRecord(req.body);
    res.json({ success: true, message: "Event created successfully" });
  } catch (err) { next(err); }
};

export const updateEvent = async (req, res, next) => {
  try {
    await eventService.updateEventById(req.params.id, req.body);
    res.json({ success: true, message: "Event updated successfully" });
  } catch (err) { next(err); }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEventById(req.params.id);
    res.json({ success: true, message: "Event deleted successfully" });
  } catch (err) { next(err); }
};
