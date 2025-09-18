import { prisma } from '../database/client.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

export class AuthController {
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendEmail(to, subject, content) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // true para 465, false para 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Watchlist App" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: content,
      html: `<p>${content}</p>`,
    });
  }

  async sendVerificationCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await prisma.emailVerificationCode.deleteMany({ where: { email } });

      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10m

      await prisma.emailVerificationCode.create({
        data: { email, code, expiresAt },
      });

      await this.sendEmail(
        email,
        'Código de Verificação',
        `Seu código de verificação é: ${code}. Válido por 10 minutos.`
      );

      res.json({ message: 'Código de verificação enviado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  }

  async validateVerificationCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: 'Email e código são obrigatórios' });
      }

      const verificationCode = await prisma.emailVerificationCode.findFirst({
        where: {
          email,
          code,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!verificationCode) {
        return res.status(400).json({ message: 'Código inválido ou expirado' });
      }

      await prisma.emailVerificationCode.update({
        where: { id: verificationCode.id },
        data: { used: true },
      });

      await prisma.user.update({
        where: { email },
        data: { isEmailVerified: true },
      });

      res.json({ message: 'Email verificado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  }

  async sendPasswordResetCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório' });
      }

      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      await prisma.passwordResetCode.deleteMany({ where: { email } });

      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15m

      await prisma.passwordResetCode.create({
        data: { email, code, expiresAt },
      });

      await this.sendEmail(
        email,
        'Redefinição de Senha',
        `Seu código para redefinir a senha é: ${code}. Válido por 15 minutos.`
      );

      res.json({ message: 'Código de redefinição enviado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  }

  async validatePasswordResetCode(req, res) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: 'Email e código são obrigatórios' });
      }

      const resetCode = await prisma.passwordResetCode.findFirst({
        where: {
          email,
          code,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!resetCode) {
        return res.status(400).json({ message: 'Código inválido ou expirado' });
      }

      res.json({ message: 'Código válido', valid: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        return res.status(400).json({ message: 'Email, código e nova senha são obrigatórios' });
      }

      const resetCode = await prisma.passwordResetCode.findFirst({
        where: {
          email,
          code,
          used: false,
          expiresAt: { gt: new Date() },
        },
      });

      if (!resetCode) {
        return res.status(400).json({ message: 'Código inválido ou expirado' });
      }

      await prisma.passwordResetCode.update({
        where: { id: resetCode.id },
        data: { used: true },
      });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { email },
        data: { passwordHash: hashedPassword },
      });

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
    }
  }
}
