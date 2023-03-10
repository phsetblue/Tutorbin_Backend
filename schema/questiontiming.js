import mongoose from "mongoose";

const QuestionTimingSchema = new mongoose.Schema({
  Type: {
    type: String,
    required: true
  },
  first_time: {
    type: Number,
    required: true
  },
  second_time: {
    type: Number,
    required: true
  },
  skip_time: {
    type: Number,
    required: true
  },
  remaining_time: {
    type: Number,
    required: true
  }
});

export default mongoose.model('QuestionTiming', QuestionTimingSchema, 'QuestionTiming');

