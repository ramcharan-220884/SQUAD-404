import * as ticketService from "../services/ticketService.js";

export const getTickets = async (req, res, next) => {
  try {
    const data = await ticketService.fetchTickets(req.query);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

export const updateTicketStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;
    const ticket = await ticketService.updateTicketStatusById(id, status);
    if (ticket && ticket.reporter_id) {
      req.io.to(`student_${ticket.reporter_id}`).emit("ticketReply", {
        ticketId: id,
        status,
        title: ticket.title,
        message: `Your ticket status has been updated to ${status}`
      });
    }
    res.json({ success: true, message: "Ticket status updated" });
  } catch (err) { next(err); }
};
