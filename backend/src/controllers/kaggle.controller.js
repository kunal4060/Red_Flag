import kaggleService from "../services/kaggle.service.js";

export const analyzeBatch = async (req, res) => {
  try {
    const { urls } = req.body;
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ 
        success: false, 
        message: "urls array required" 
      });
    }

    if (urls.length === 0) {
      return res.status(200).json({ 
        success: true, 
        results: [] 
      });
    }

    console.log(`Analyzing ${urls.length} URLs with Kaggle RF...`);

    // Analyze URLs with Kaggle service
    const results = await kaggleService.predictBatch(urls);

    console.log("Kaggle analysis complete");

    return res.status(200).json({ 
      success: true, 
      results: results 
    });

  } catch (err) {
    console.error("Kaggle analyzeBatch error:", err);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: err.message
    });
  }
};
