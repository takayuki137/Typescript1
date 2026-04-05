import { prisma } from "@/lib/prisma";
import PostForm from "./components/PostForm";
import StudyInput from "./components/StudyInput";
import LikeButton from "./components/LikeButton";


export default async function Home() {
  try {
    // テスト用にDBに仮のデータを追加
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
       create: {
       email: "test@example.com",
       passwordHash: "test",  // 必須
       role: "user",           // 必須
      
       }
     })

    // Postのupsert（追加）
    const post =await prisma.post.upsert({
    where: { id: 1 },
    update: { content: "テスト内容" },
    create: {
    title: "テストタイトル",
    content: "テスト内容",
    userId: user.id  // ↑で作ったuserのIDを使う
  }
})



    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();


    return (
      <div>
        <StudyInput></StudyInput>
        {/* <PostForm></PostForm> */}
        <LikeButton></LikeButton>
        <h1>Users</h1>
        <pre>{JSON.stringify(users, null, 2)}</pre>
        <h1>Posts</h1>
        <pre>{JSON.stringify(posts, null, 2)}</pre>
      </div>
      
      
    );
  } catch (e) {
    console.error(e);
    return <div>DB error</div>;
  }
  


}