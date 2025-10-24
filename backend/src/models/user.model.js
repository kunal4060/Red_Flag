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

        plan: {
            type: String,
            required: true,
            default: "free"
        },

        tokens: {
            type: Number,
            required: true,
            default: 10  // Free plan gets 10 tokens
        },

        tokensUsed: {
            type: Number,
            required: true,
            default: 0
        }

    },

    {
        timestamps: true
    }
);

// Helper method to get token limit based on plan
userSchema.methods.getTokenLimit = function() {
    const limits = {
        free: 10,
        basic: 50,
        premium: 200,
        enterprise: -1  // unlimited
    };
    return limits[this.plan] || limits.free;
};

// Helper method to check if user has tokens
userSchema.methods.hasTokens = function() {
    const limit = this.getTokenLimit();
    if (limit === -1) return true;  // unlimited
    return this.tokensUsed < limit;
};

// Helper method to consume a token
userSchema.methods.consumeToken = async function() {
    const limit = this.getTokenLimit();
    if (limit !== -1 && this.tokensUsed >= limit) {
        throw new Error("Token limit exceeded");
    }
    this.tokensUsed += 1;
    await this.save();
    return this.tokensUsed;
};

const User = mongoose.model("User", userSchema);

export default User