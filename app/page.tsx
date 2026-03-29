import { prisma } from "@/lib/prisma";

export default async function Home() {
  try {
    // テスト用にDBに仮のデータを追加
    await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Taro",
      },
    });

    const users = await prisma.user.findMany();

    return (
      <div>
        <h1>Users</h1>
        <pre>{JSON.stringify(users, null, 2)}</pre>
      </div>
    );
  } catch (e) {
    console.error(e);
    return <div>DB error</div>;
  }
}