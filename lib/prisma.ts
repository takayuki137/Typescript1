import { PrismaClient } from '@/app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  idleTimeoutMillis: 0,        // 切断防止
  connectionTimeoutMillis: 10000,//一定時間使われなかったら接続を捨てる
})
//Poolは「必要になったら接続を作って、終わったら捨てずに取っておく」イメージ
//接続確立を2秒待ってダメなら諦める

const adapter = new PrismaPg(pool)
//poolとpostgresqlの橋渡し役なぜならprismaとpostgresqlの話す言語が違うから

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}
//prismaのNEW関連の新しく作る過程がホットリロードで走るのをスキップできるコード
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({adapter})
  //アダプターを渡さないと
  // → PrismaがPool無視して独自に接続を作る
　// → せっかく作ったPoolが無駄になる

if (process.env.NODE_ENV !== 'production') 
  globalForPrisma.prisma = prisma
