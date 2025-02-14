import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit') ?? 10;
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon; 
    } catch (error) {
      this.handleExceptions( error );
    }
  }

  findAll( paginationDto: PaginationDto ) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto

    return this.pokemonModel
              .find()
              .limit( limit )
              .skip( offset )
              .sort({
                no: 1
              })
              .select('-__v');
  }

  async findOne(term: string) {
    let pokemon: Pokemon | null = null;

    if ( !isNaN(+term) ) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    if ( !pokemon && isValidObjectId( term ) ) {
      pokemon = await this.pokemonModel.findById( term );
    }

    if ( !pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLocaleLowerCase().trim() });
    }

    if ( !pokemon )
      throw new NotFoundException(`Pokemon with id, name or no '${ term }' not found`);

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );

    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase()

    try {
      await pokemon.updateOne( updatePokemonDto );
    } catch (error) {
      this.handleExceptions( error );
    }

    return { ...pokemon.toJSON(), ...updatePokemonDto };
  }

  async remove(_id: string) {
    // const pokemon: Pokemon = await this.findOne( id );
    // await pokemon.deleteOne();

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id });

    if ( deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id ${ _id } not found`);
  }

  private handleExceptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(`The pokemon already exists`)
    }

    throw new InternalServerErrorException(`Can't create pokemon`);
  }
}
