import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultEmail = "test@adminafnan.com";
const defaultName = "Test Admin";
const defaultPassword = "admin@afnan000";

function parseArg(name: string, fallback: string) {
  const flag = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (flag) return flag.slice(flag.indexOf("=") + 1);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1]) return process.argv[idx + 1];
  return fallback;
}

async function main() {
  const email = parseArg("email", defaultEmail);
  const name = parseArg("name", defaultName);
  const password = parseArg("password", defaultPassword);

  console.log(`\n🔐 Create or update admin user`);
  console.log(`   Email: ${email}`);
  console.log(`   Name: ${name}`);
  console.log(`   Password: ${password}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: {
        name,
        password: hashedPassword,
        role: "admin",
        updatedAt: new Date(),
      },
    });
    console.log(`   ✅ Updated existing admin user ${email}`);
  } else {
    const usernameBase = email.split("@")[0];
    let username = usernameBase;
    let count = 1;

    while (
      await prisma.user.findFirst({
        where: { username },
        select: { id: true },
      })
    ) {
      username = `${usernameBase}${count}`;
      count += 1;
    }

    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        username,
        role: "admin",
        createdAt: new Date(),
      },
    });
    console.log(`   ✅ Created admin user ${email}`);
  }

  console.log(`\n   Use these credentials to log in:`);
  console.log(`     email: ${email}`);
  console.log(`     password: ${password}`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
