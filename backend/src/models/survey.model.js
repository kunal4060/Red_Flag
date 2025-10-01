import mongoose from "mongoose";

const surveySchema = new mongoose.Schema(
  {
    source: { type: String, required: true },
    profession: { type: String, required: true },
    ageGroup: { type: String, required: true },
  },
  { timestamps: true }
);

const Survey = mongoose.model("Survey", surveySchema);

export default Survey;