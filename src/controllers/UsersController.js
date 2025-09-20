import { prisma } from '../database/client.js';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export class UsersController {
    async checkEmail(req, res) {
        const { email } = req.body

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            if (user) {
                res.status(409).json({ message: "This email is already in use" })
                return
            }

            res.status(200).json({ message: "Email is avaible" })
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Erro interno no servidor", error: error.message });
        }
    }
    async create(req, res) {
        try {
            const { name, email, password } = req.body

            const userByEmail = await prisma.user.findUnique({
                where: {
                    email
                }
            })

            if (userByEmail) {
                res.status(409).json({ message: "E-mail already exists" })
                return
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword
                }
            })

            res.status(201).json({ newUser, message: "User created successfully" })
        } catch (error) {
            console.error(error)
            res.status(500).json({ message: "Internal Server Error", error: error.message })
        }
    }

    async login(req, res) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({
                where: { email }
            });

            const secretKey = process.env.SECRET_KEY;
            if (!secretKey) {
                throw new Error('SECRET_KEY is not defined in environment variables');
            }

            if (user && bcrypt.compareSync(password, user.passwordHash)) {
                const token = jwt.sign({ id: user.id, username: user.username, emailVerified: user.isEmailVerified }, secretKey, { expiresIn: '1h' });

                const { passwordHash, ...safeUser } = user;

                res.json({ token, user: safeUser });
                return;
            }

            res.status(401).json({ message: "Invalid credentials" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async updateUsername(req, res) {

        const { username } = req.body;
        const userId = req.user?.id;

        if (!username) {
            res.status(400).json({ message: "Username is required" });
            return;
        }

        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        try {
            const usernameExists = await prisma.user.findUnique({
                where: { username },
            });

            if (usernameExists) {
                res.status(409).json({ message: "Username already exists" });
                return;
            }

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { username },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                },
            });

            res.status(200).json({ message: "Username updated successfully", user: updatedUser });
            return;

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
            return;
        }
    }


    async profile(req, res) {
        res.json(req.user)
    }
}