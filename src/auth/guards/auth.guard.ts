import { AuthService } from './../auth.service';
import { JwtService } from '@nestjs/jwt';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../interfaces/jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(
    private jwtService : JwtService,
    private authService : AuthService
  ){}

  async canActivate( context: ExecutionContext ) : Promise<boolean> {
    const request = context.switchToHttp().getRequest(); // Trae con https (headers, body, query params, user, etc)
    const token = this.extractTokenFromHeader(request); // Extrae el token

    if (!token) { // Si no hay token manda un error
      throw new UnauthorizedException('No hay Token');
    }

    /* Verifica que el token sea valido */
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>( // Verifica que el token sea valido y no este expirado. <JwtPayload> especifica el tipo de dato esperado (id, emal, role, etc).
        token, { secret: process.env.JWT_SEED } // agregar la palabra secreta
      );

      const user = await this.authService.findUserByid(payload.id);
      if( !user ) throw new UnauthorizedException('User does not exists');
      if( !user.isActive ) throw new UnauthorizedException('User is not active');

      
      request['user'] = user; // guarda el id del usuario en el objeto request, para saber quien hizo la petición

      console.log({payload});

    } catch (error) {
      throw new UnauthorizedException();
    }

    //console.log({request});
    //console.log({token});

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
