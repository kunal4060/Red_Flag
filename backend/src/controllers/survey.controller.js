import Survey from "../models/survey.model.js";

export const submitSurvey = async (req, res) => {
  try {
    const { source, profession, ageGroup } = req.body;
    if (!source || !profession || !ageGroup) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const survey = new Survey({ source, profession, ageGroup });
    await survey.save();
    res.status(201).json({ message: "Survey submitted" });
  } catch (error) {
    console.log("Error in submitSurvey:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};