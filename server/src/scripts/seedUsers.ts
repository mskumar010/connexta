import { User } from "../models/User";
import bcrypt from "bcryptjs";

const SEED_USERS = [
  {
    displayName: "X",
    email: "x@x.com",
  },
  {
    displayName: "Y",
    email: "y@y.com",
  },
  {
    displayName: "Z",
    email: "z@z.com",
  },
];

export async function seedUsers() {
  try {
    for (const userData of SEED_USERS) {
      // Password is the email
      const passwordHash = await bcrypt.hash(userData.email, 10);
      // Connection ID is the email
      const connectionId = userData.email;

      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        existingUser.passwordHash = passwordHash;
        existingUser.connectionId = connectionId;
        existingUser.displayName = userData.displayName;
        // Ensure onboarding is complete
        existingUser.hasCompletedOnboarding = true;
        await existingUser.save();
        console.log(`Updated seed user: ${userData.displayName}`);
      } else {
        const user = new User({
          ...userData,
          connectionId,
          passwordHash,
          hasCompletedOnboarding: true,
        });
        await user.save();
        console.log(`Created seed user: ${userData.displayName}`);
      }
    }
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}
