const express = require("express");
const axios = require("axios");
const FormData = require("form-data");
const { fileTypeFromBuffer } = require("file-type");
const fileUpload = require("express-fileupload");

const router = express.Router();

// Middleware para lidar com uploads
router.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}));

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg", "image/jpg", "image/png", "image/gif",
  "image/webp", "image/bmp", "image/tiff", "image/svg+xml",
];

async function validateImageBuffer(buffer) {
  try {
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType) throw new Error("Could not detect file type");
    if (!ALLOWED_IMAGE_TYPES.includes(fileType.mime)) {
      throw new Error(`Unsupported file type: ${fileType.mime}. Only image files are allowed.`);
    }
    return { isValid: true, mime: fileType.mime, ext: fileType.ext };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
}

class PinterestLensScraper {
  constructor(customHeaders = {}) {
    this.headers = {
      "authority": "api.pinterest.com",
      "accept-language": "id-ID",
      "user-agent": "Pinterest for Android/13.25.2 (itel S665L; 12)",
      "x-pinterest-advertising-id": "cbb23c37-6256-4f72-b691-fb18166d5ce4",
      "x-pinterest-app-type-detailed": "3",
      "x-pinterest-device": "itel S665L",
      "x-pinterest-device-hardwareid": "b58f872527417271",
      "x-pinterest-installid": "19dcdf8854774600ad72b0ceb78bb4b",
      "x-pinterest-appstate": "background",
      "x-node-id": "true",
      "authorization": "Bearer pina_AEATFWAVABS42AAAGBAHIDFCT2BMXFYBABHO2KYRDEFCPLLAULSIJKJDET3E6GDUVZBUBQVWIJJWBIPBF2SAKFLPBZAPIMQA",
      "accept-encoding": "gzip",
      ...customHeaders,
    };
  }

  getVideoUrl(videoList) {
    return (
      videoList?.V_HLSV3_MOBILE?.url ||
      videoList?.V_DASH_HEVC?.url ||
      videoList?.V_HEVC_MP4_T1_V2?.url ||
      videoList?.V_HEVC_MP4_T2_V2?.url ||
      videoList?.V_HEVC_MP4_T3_V2?.url ||
      videoList?.V_HEVC_MP4_T4_V2?.url ||
      videoList?.V_HEVC_MP4_T5_V2?.url ||
      videoList?.V_720P?.url ||
      null
    );
  }

  async search(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) throw new Error("Image buffer is required");

    const validation = await validateImageBuffer(buffer);
    if (!validation.isValid) throw new Error(`File validation failed: ${validation.error}`);

    const form = new FormData();
    form.append("camera_type", "0");
    form.append("source_type", "1");
    form.append("video_autoplay_disabled", "0");
    form.append("page_size", "12");
    form.append("fields", "pin.{id,title,description,images,videos,native_creator,aggregated_pin_data,comment_count,total_reaction_count,is_repin,is_native,is_promoted,is_unsafe,created_at,grid_title,story_pin_data}");
    form.append("image", buffer, `pin_${Date.now()}.jpg`);

    const { data } = await axios.post(
      "https://api.pinterest.com/v3/visual_search/lens/search/",
      form,
      { headers: { ...form.getHeaders(), ...this.headers } }
    );

    return data.data.map((pin) => {
      const isVideo = !!(pin.videos || pin.story_pin_data?.pages_preview?.[0]?.video);
      let media = {};

      if (isVideo) {
        const videoList = pin.videos?.video_list || pin.story_pin_data?.pages_preview?.[0]?.video?.video_list;
        media = {
          type: "video",
          url: this.getVideoUrl(videoList),
          thumbnailUrl: videoList?.V_HEVC_MP4_T5_V2?.thumbnail || videoList?.V_720P?.thumbnail || videoList?.V_HLSV3_MOBILE?.thumbnail || pin.images?.["736x"]?.url || "",
        };
      } else {
        media = {
          type: "image",
          url: pin.story_pin_data?.pages_preview?.[0]?.image?.images?.originals?.url || pin.images?.originals?.url || pin.images?.["736x"]?.url || "",
        };
      }

      return {
        id: pin.id,
        title: pin.title || pin.grid_title || "",
        description: pin.description || "",
        media,
        creator: pin.native_creator
          ? {
              name: pin.native_creator.full_name,
              username: pin.native_creator.username,
              followers: pin.native_creator.follower_count || 0,
              avatar: pin.native_creator.image_medium_url || null,
              url: `https://pinterest.com/${pin.native_creator.username}/`,
            }
          : null,
        stats: {
          saves: pin.aggregated_pin_data?.aggregated_stats?.saves || 0,
          comments: pin.comment_count || 0,
          reactions: pin.total_reaction_count || 0,
        },
        metadata: {
          is_video: isVideo,
          is_repin: pin.is_repin || false,
          is_native: pin.is_native || false,
          is_promoted: pin.is_promoted || false,
          is_unsafe: pin.is_unsafe || false,
        },
        created_at: pin.created_at ? new Date(pin.created_at).toLocaleString("en-US") : null,
        url: `https://pinterest.com/pin/${pin.id}/`,
      };
    });
  }
}

async function searchPinterestFromUrl(imageUrl) {
  if (!imageUrl) throw new Error("Image URL cannot be empty");
  const imageBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
  const scraper = new PinterestLensScraper();
  const results = await scraper.search(Buffer.from(imageBuffer));
  return { status: true, total_results: results.length, results };
}

async function searchPinterestFromFile(fileBuffer) {
  const scraper = new PinterestLensScraper();
  const results = await scraper.search(fileBuffer);
  return { status: true, total_results: results.length, results };
}

// GET: search by image URL
router.get("/api/s/pinterest-lens", async (req, res) => {
  const { imageUrl } = req.query;
  if (!imageUrl) return res.status(400).json({ status: false, error: "Parameter 'imageUrl' is required" });

  try {
    const result = await searchPinterestFromUrl(imageUrl);
    res.json({ status: true, data: { ...result, search_image: imageUrl }, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message || "Pinterest Lens search failed" });
  }
});

// POST: search by uploaded image file
router.post("/api/s/pinterest-lens", async (req, res) => {
  try {
    if (!req.files || !req.files.image) return res.status(400).json({ status: false, error: "Missing file 'image'" });

    const file = req.files.image.data;
    const result = await searchPinterestFromFile(file);

    res.json({ status: true, data: result, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message || "Pinterest Lens search failed" });
  }
});

module.exports = router;