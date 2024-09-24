import { bucket } from "../constants.js";
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const { title, description } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: "Title and description are required." });
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on("error", (err) => {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Unable to upload file to Google Cloud Storage." });
  });

  blobStream.on("finish", async () => {
    await blob.setMetadata({
      metadata: {
        title,
        description,
      },
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

    res.status(200).json({
      message: "File uploaded successfully.",
      fileUrl: publicUrl,
      metadata: {
        title,
        description,
      },
    });
  });

  blobStream.end(req.file.buffer);
};
