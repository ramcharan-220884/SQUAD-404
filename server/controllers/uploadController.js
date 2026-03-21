export const uploadFile = (req, res) => {
  if (!req.file) {
    if (res.sendError) return res.sendError("No file uploaded", 400);
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  // Generate URL path for the database
  const fileUrl = `/uploads/${req.file.filename}`;

  if (res.sendResponse) {
    return res.sendResponse({ url: fileUrl }, "File uploaded successfully");
  }

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    data: { url: fileUrl }
  });
};
