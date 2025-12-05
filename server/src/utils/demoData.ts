import { User } from '../models/User';
import { Message } from '../models/Message';

const DEMO_USERS = [
    {
        email: 'engineer_wingineer@demo.com',
        username: 'engineer_wingineer',
        displayName: 'engineer_wingineer',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=engineer_wingineer',
    },
    {
        email: 'ThrowayRA3962@demo.com',
        username: 'ThrowayRA3962',
        displayName: 'ThrowayRA3962',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ThrowayRA3962',
    },
    {
        email: 'Afternoon_Gold@demo.com',
        username: 'Afternoon_Gold',
        displayName: 'Afternoon_Gold',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Afternoon_Gold',
    },
    {
        email: 'harshilin@demo.com',
        username: 'harshilin',
        displayName: 'harshilin',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=harshilin',
    },
    {
        email: 'PuzzleheadedGrand655@demo.com',
        username: 'PuzzleheadedGrand655',
        displayName: 'PuzzleheadedGrand655',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=PuzzleheadedGrand655',
    },
];

export async function ensureDemoUsers() {
    const users = [];
    for (const demoUser of DEMO_USERS) {
        try {
            const user = await User.findOneAndUpdate(
                { email: demoUser.email },
                {
                    $setOnInsert: {
                        email: demoUser.email,
                        passwordHash: 'demo_password_hash',
                        displayName: demoUser.displayName,
                        avatarUrl: demoUser.avatarUrl,
                        hasCompletedOnboarding: true,
                    },
                },
                { upsert: true, new: true }
            );
            users.push(user);
        } catch (error) {
            console.error(`Failed to ensure demo user ${demoUser.email}:`, error);
            // Try to find it if upsert failed (rare race condition edge case)
            const user = await User.findOne({ email: demoUser.email });
            if (user) users.push(user);
        }
    }
    return users;
}

export async function populateRoomMessages(roomId: string) {
    const users = await ensureDemoUsers();
    const now = new Date();
    const getPastTime = (minutes: number) => new Date(now.getTime() - minutes * 60000);

    // Root message 1
    const msg1 = await Message.create({
        roomId,
        senderId: users[0]._id,
        text: 'You should tweet this. Rapido should compensate for health and asset damages',
        seq: 1,
        createdAt: getPastTime(60),
        updatedAt: getPastTime(60),
    });

    // Reply to msg1
    const msg2 = await Message.create({
        roomId,
        senderId: users[1]._id,
        text: 'they don\'t even acknowledge tweets bro',
        seq: 2,
        parentId: msg1._id,
        createdAt: getPastTime(55),
        updatedAt: getPastTime(55),
    });

    // Reply to msg2
    const msg3 = await Message.create({
        roomId,
        senderId: users[0]._id,
        text: 'Welll in that case hire a lawyer make a good case in consumer court',
        seq: 3,
        parentId: msg2._id,
        createdAt: getPastTime(50),
        updatedAt: getPastTime(50),
    });

    // Root message 2
    const msg4 = await Message.create({
        roomId,
        senderId: users[2]._id,
        text: 'I just posted this. Tho i don\'t have any followers as i don\'t use x much\n\nHere\'s the link: https://x.com/daniyalm1300/status/1996561526258594213?s=46',
        seq: 4,
        createdAt: getPastTime(45),
        updatedAt: getPastTime(45),
    });

    // Reply to msg4
    const msg5 = await Message.create({
        roomId,
        senderId: users[3]._id,
        text: 'reposted',
        seq: 5,
        parentId: msg4._id,
        createdAt: getPastTime(40),
        updatedAt: getPastTime(40),
    });

    // Another reply to msg4
    const msg6 = await Message.create({
        roomId,
        senderId: users[4]._id,
        text: 'Reposted brother dw',
        seq: 6,
        parentId: msg4._id,
        createdAt: getPastTime(35),
        updatedAt: getPastTime(35),
    });

    // Update reply counts
    await Message.findByIdAndUpdate(msg1._id, { replyCount: 1 });
    await Message.findByIdAndUpdate(msg2._id, { replyCount: 1 });
    await Message.findByIdAndUpdate(msg4._id, { replyCount: 2 });

    return [msg1, msg2, msg3, msg4, msg5, msg6];
}
