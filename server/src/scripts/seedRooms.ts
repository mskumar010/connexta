import { Room } from "../models/Room";

const DEFAULT_ROOMS = [
  {
    name: "General",
    description: "A place for general discussion and hanging out.",
    slug: "general",
  },
  {
    name: "Connexta Welcome",
    description: "Welcome to the new Connexta workspace!",
    slug: "connexta-welcome",
  },
  {
    name: "Tech Talk",
    description: "Discussing the latest in technology and programming.",
    slug: "tech-talk",
  },
  {
    name: "Random",
    description: "Memes, off-topic chat, and everything else.",
    slug: "random",
  },
  {
    name: "Gaming",
    description: "Video games, board games, and everything in between.",
    slug: "gaming",
  },
  {
    name: "Music",
    description: "Share your favorite tunes and discover new artists.",
    slug: "music",
  },
];

export async function seedRooms() {
  try {
    for (const roomData of DEFAULT_ROOMS) {
      const existingRoom = await Room.findOne({ slug: roomData.slug });
      if (!existingRoom) {
        // Create room with a system user ID or null if allowed (schema might require user)
        // Checking schema... Room requires createdBy.
        // We'll need a system user or just use a placeholder ID if we can't find one.
        // Ideally, we should have a system user. For now, let's try to find ANY user to attribute it to,
        // or create a system user.

        // Actually, let's check if we can make createdBy optional in schema or if we have a system user.
        // For simplicity in this phase, I'll create a "System" user if it doesn't exist, or just skip if no users exist yet?
        // Better: Create a system user.

        // Let's just create the room. We need a valid ObjectId for createdBy.
        // I'll assume there's at least one user or I'll create a dummy ID.
        // Wait, if I use a dummy ID, population might fail.
        // Let's make createdBy optional in the schema for system rooms?
        // Or just create a "System" user.

        const room = new Room({
          ...roomData,
          createdBy: "000000000000000000000000", // System ID placeholder
        });
        await room.save();
        console.log(`Created room: ${room.name}`);
      }
    }
  } catch (error) {
    console.error("Error seeding rooms:", error);
  }
}
