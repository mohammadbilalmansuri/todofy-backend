import { Schema, model } from "mongoose";

const todoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      maxlength: [150, "Title cannot be more than 150 characters"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [300, "Description cannot be more than 300 characters"],
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
