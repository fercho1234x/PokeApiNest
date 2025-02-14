import { Inject, Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { HttpAdapter } from '../common/interfaces/http-adapter.interface';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    @Inject('HttpAdapter') private readonly httpAdapter: HttpAdapter
  ) {}

  async executeSeed() {

    await this.pokemonModel.deleteMany({});

    const data = await this.httpAdapter.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // const insertPromisesArray: any = [];
    const pokemonToInsert: {name: string, no: number}[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[ segments.length - 2 ];

      // insertPromisesArray.push(
      //   this.pokemonModel.create({ no, name })
      // )

      // await this.pokemonModel.create({ no, name });

      pokemonToInsert.push({ no, name });
    })

    // await Promise.all( insertPromisesArray );
    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed execute';
  }

}
