import { Schema, model } from "mongoose";

const todoSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Text is required"],
      maxlength: [300, "Text cannot be more than 300 characters"],
      trim: true,
    },
    status: {
      type: Boolean,
      default: false,
    },
    dueTime: {
      type: String,
      required: [true, "Due time is required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner id is required"],
    },
  },
  { timestamps: true }
);

const Todo = model("Todo", todoSchema);

export default Todo;
