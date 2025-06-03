import { LoginDto } from './dto/login.dto';
import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import * as bcryptjs from "bcryptjs";

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel( User.name ) 
    private userModel: Model<User>,
    private jwtService: JwtService
  ){}

  async create(createUserDto: CreateUserDto): Promise<User> {
    //console.log(createAuthDto);

    try{
      //const newUser = new this.userModel( createUserDto );

      /* Encriptar la contraseña */
      const { password, ...userData} = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

  
      /* Guardar el usuario */
  
      /* Generar el JWT */

      await newUser.save();
      const {password:_, ...user } = newUser.toJSON(); // excluyo la contraseña

      return user; // solo devuelvo los datos sin la contraseña

      //return newUser.save(); // Devuelve una promesa

    }catch(error){
      //console.log(error.code)
      if(error.code === 11000 ){ 
        throw new BadRequestException(`${ createUserDto.email} already exists!`);
      }

      throw new InternalServerErrorException(' Something terrible happen!!! ');
    }

  }

  async register(registerDto: RegisterDto): Promise<LoginResponse>{

    const user = await this.create( registerDto );
    console.log({user});

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }

  async login(loginDto: LoginDto):Promise<LoginResponse>{
    //console.log({ loginDto });

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email }); // busca al usuario por el email
    if( !user ){
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if ( !bcryptjs.compareSync(password, user.password! )){ // Compara las contraseña que viene con la que esta en la BD
      throw new UnauthorizedException('Not valid credentials - password');
    }

    const { password:_, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }

    /**
     * User { _id, name, email, roles }
     * Token -> dsfdmbdf.fdsfdsf.fsdsd
     * */ 
  }

  findAll():Promise<User[]> {
    return this.userModel.find();
  }

  async findUserByid(id: string){
    const user = await this.userModel.findById(id);

    if (!user) return null;

    const { password, ...data } = user.toJSON();
    return data; //devuelve el usuario sin la password
  }




/*   findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  } */

  getJwtToken(payload: JwtPayload ){
    const token = this.jwtService.sign(payload);
    return token;
  }
}
