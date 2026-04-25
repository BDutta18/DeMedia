import { Request, Response } from "express";
import { Keypair } from "@stellar/stellar-sdk";
import crypto from "crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import User from "../models/user.models"; // ✅ make sure this path is correct

export const verifyWalletSignature = async (req: Request, res: Response) => {
  console.log("🔥 Incoming body type:", typeof req.body, req.body);

  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ✅ Verify the wallet signature
    const SIGN_MESSAGE_PREFIX = "Stellar Signed Message:\n";
    const messageHash = crypto
      .createHash("sha256")
      .update(SIGN_MESSAGE_PREFIX + message)
      .digest();

    let isVerified = false;
    try {
        const kp = Keypair.fromPublicKey(address);
        isVerified = kp.verify(messageHash, Buffer.from(signature, "base64"));
    } catch (e) {
        console.error("Verification error", e);
    }

    if (!isVerified) {
      return res.status(401).json({ message: "Signature verification failed" });
    }

    // ✅ Check if the user already exists in DB
    let user = await User.findOne({ address });

    if (!user) {
      // 🆕 Create user on first login
      user = await User.create({
      address,
      name: "anonymous"
    });
      console.log("🆕 New user created:", address);
    } else {
      console.log("✅ Existing user logged in:", address);
    }

    // ✅ Create JWT token
    const options: SignOptions = {
      expiresIn: (process.env.TOKEN_EXPIRY ?? "7d") as SignOptions["expiresIn"],
    };

    const token = jwt.sign({ address }, process.env.JWT_SECRET as string, options);

    // ✅ Return both token + user info
    return res.json({
      message: "Wallet verified successfully",
      address,
      token,
      user,
    });
  } catch (error) {
    console.error("JWT Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
