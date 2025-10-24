import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"

export const signup = async (req, res) => {
    const {firstName, lastName, email, password} = req.body;
    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({message: "All fields are required"});
        }
        if (password.length < 6) {
            return res.status(400).json({message: "Password must be atleast 6 characters"});
        }

        const user = await User.findOne({email})
        if (user) {
            return res.status(400).json({message: "Email already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            firstName,
            lastName,
            email,
            password:hashedPassword
        })

        if (newUser) {
            // generate jwt token
            //generateToken(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                plan: newUser.plan,
                tokensUsed: newUser.tokensUsed,
                tokenLimit: newUser.getTokenLimit(),
            });
        } else {
            res.status(400).json({message: "Invalid User Data"});
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        generateToken(user._id, res);

        res.status(200).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            plan: user.plan,
            tokensUsed: user.tokensUsed,
            tokenLimit: user.getTokenLimit(),
        });

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
        
    }
}

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}


export const checkAuth = (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      plan: user.plan,
      tokensUsed: user.tokensUsed,
      tokenLimit: user.getTokenLimit(),
    });
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!plan) return res.status(400).json({ message: "Plan is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update plan and reset tokens used when upgrading
    user.plan = plan;
    if (plan !== req.user.plan) {
      user.tokensUsed = 0;  // Reset tokens on plan change
    }
    await user.save();

    res.status(200).json({ 
      message: "Plan updated", 
      plan: user.plan,
      tokensUsed: user.tokensUsed,
      tokenLimit: user.getTokenLimit(),
    });
  } catch (error) {
    console.log("Error in updatePlan controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const consumeToken = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.hasTokens()) {
      return res.status(403).json({ 
        message: "Token limit exceeded. Please upgrade your plan.",
        tokensUsed: user.tokensUsed,
        tokenLimit: user.getTokenLimit(),
      });
    }

    await user.consumeToken();

    res.status(200).json({
      message: "Token consumed",
      tokensUsed: user.tokensUsed,
      tokenLimit: user.getTokenLimit(),
    });
  } catch (error) {
    console.log("Error in consumeToken controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTokenStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      tokensUsed: user.tokensUsed,
      tokenLimit: user.getTokenLimit(),
      hasTokens: user.hasTokens(),
      plan: user.plan,
    });
  } catch (error) {
    console.log("Error in getTokenStatus controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Extension-specific login that returns JWT token in response body
export const extensionLogin = async (req, res) => {
  const {email, password} = req.body;
  try {
    const user = await User.findOne({email});
    if (!user) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({message: "Invalid Credentials"});
    }

    // Generate token but return it in the response instead of cookie
    const token = generateToken(user._id, res, true); // Pass true to skip setting cookie

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        plan: user.plan,
        tokensUsed: user.tokensUsed,
        tokenLimit: user.getTokenLimit(),
      }
    });

  } catch (error) {
    console.log("Error in extensionLogin controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};