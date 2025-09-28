import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
            minLength: 6,
        },

        firstName: {
            type: String,
            required: true,
        },

        lastName: {
            type: String,
            required: true,
        },

        profilePic: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            default: "Available"
        },
    },

    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

export default User