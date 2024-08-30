import { PrismaClient } from '@prisma/client';
export interface User {
    id: number;
    firstname: string;
    lastname: string;
    username: string;
    password: string;
    role: string
}

export interface Post{
    id: number;
    title: string;
    createdAt: Date;
    content: string;
    authorId: number,
}

export interface Comment{
    id: number;
    content: string;
    createdAt: Date;
    postId: number;
    authorId: number;
}

export enum Role {
    USER = "USER",
    ADMIN = "ADMIN"
}

export class UserQueries {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async updateUser( id: number, firstname: string, lastname: string, username: string, password: string): Promise<boolean> {
        try {
          const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
              id,
              firstname,
              lastname,
              username,
              password, 
            },
          });
    
          return !!updatedUser;
        } catch (error) {
          if (error instanceof Error) {
            if ('code' in error && (error as any).code === 'P2025') {
              console.error("User not found:", error.message);
              return false; 
            }
            console.error("Error updating user:", error.message);
          }
          throw new Error("Internal server error"); 
        }
      }

      async deleteUser(id: number): Promise<boolean> {
        try {
          const deletedUser = await this.prisma.user.delete({
            where: { id },
          });
    
          return !!deletedUser;
        } catch (error) {
          if (error instanceof Error) {
            if ('code' in error && (error as any).code === 'P2025') {
              console.error("User not found:", error.message);
              return false; 
            }
            console.error("Error deleting user:", error.message);
          }
          throw new Error("Internal server error"); 
        }
      }

      async getUser(username: string): Promise<User | null> {
        try {
          const user = await this.prisma.user.findUnique({
            where: { username },
          });
          return user;
        } catch (error) {
          console.error("Error fetching user by username:", error instanceof Error ? error.message : error);
          throw new Error("Internal server error");
        }
      }
    
      async getUserById(id: number): Promise<User | null> {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id },
          });
          return user;
        } catch (error) {
          console.error("Error fetching user by ID:", error instanceof Error ? error.message : error);
          throw new Error("Internal server error");
        }
      }
    async addUser(firstname: string, lastname: string, username: string, hashPassword: string, role: Role | undefined): Promise<void> {
        try {
            await this.prisma.user.create({
                data: {
                    firstname,
                    lastname,
                    username,
                    password: hashPassword,
                    role
                }
            });
        } catch (error) {
            console.error("Error adding user:", error);
            throw error; 
        }
    }
}

export class PostQueries {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    async getAllPosts(): Promise<Post[]>{
      try {
          const posts = await this.prisma.post.findMany({
              where: {
                 published: true
              }
          });
          return posts;
      } catch (error){
          console.error("Error fetching posts", error instanceof Error ? error.message : error);
          throw new Error("Internal server error");
      }
  }
    async getPostById( postId: number): Promise<Post | null> {
        try {
            const post = await this.prisma.post.findFirst({
                where: {
                   id: postId,
                   published: true
                }
            });
            return post;
        } catch (error){
            console.error("Error fetching post", error instanceof Error ? error.message : error);
            throw new Error("Internal server error");
        }
    }
}