import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';



@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Genera las iniciales a partir de un nombre.
   * @param name El nombre completo del usuario.
   * @returns Las dos primeras iniciales en mayúsculas.
   */
  private getInitials(name: string | null | undefined): string {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length > 1 && words[1]) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Valida un usuario comparando su email y contraseña.
   * @param email El email del usuario.
   * @param pass La contraseña en texto plano.
   * @returns El objeto de usuario si la validación es exitosa, sino null.
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.seg_usuario.findFirst({
      where: { email },
      include: {
        seg_rol: true, // Incluye la información del rol
      },
    });

    if (user && user.password && (await bcrypt.compare(pass, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  /**
   * Genera el token JWT y estructura la respuesta final para el login.
   * @param user El objeto de usuario validado.
   * @returns Un objeto con el token y la información del usuario anidada.
   */
  async login(user: any) {
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      email: user.email,
      sub: user.usuario_id,
      rol: user.seg_rol?.nombre_rol,
    };

    const userProfile = {
      id: user.usuario_id,
      nombre: user.nombre,
      email: user.email,
      rol: user.seg_rol?.nombre_rol,
      iniciales: this.getInitials(user.nombre),
    };

    return {
      user: userProfile,
      token: this.jwtService.sign(payload),
    };
  }
}