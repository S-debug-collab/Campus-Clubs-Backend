import User from "../models/User.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"



export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user → role is always student
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "student", // ⚡ secure: ignore frontend input
    });

const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

res.status(201).json({
  token,
  user
});  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const login=async(req,res)=>{
    try{
        const {email,password}=req.body;

          const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" })

        const token=jwt.sign(
            {id:user._id,role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"7d"}
        );
        res.json({ token, user });
    }
    catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};