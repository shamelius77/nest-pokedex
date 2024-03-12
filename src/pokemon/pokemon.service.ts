import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ok } from 'assert';

@Injectable()
export class PokemonService {


  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,

    ){}


// METODOS DE LA CLASE

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    
    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto ); 
      return pokemon
      
    } catch (error) {
      
      this.handlerExceptions(error);


    }


  }

  async findAll() {
      return await this.pokemonModel.find();
  }

  async findOne(term: string) {
    
    let pokemon: Pokemon;
    if(!isNaN(+term)){
        pokemon = await this.pokemonModel.findOne({no: term})
    }

    // Por MongoId
    if (!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById( term );
    }

    // Por Name
    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({name: term.toLocaleLowerCase().trim() });
    }

    if(!pokemon) throw new HttpException(`Pokemon no fue encontrado con No, Name o Id. Termino = ${term}`, HttpStatus.NOT_FOUND);
    
    return pokemon

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon =  await this.findOne(term);

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      // Escribir el pokemon en DB
       await pokemon.updateOne( updatePokemonDto )
  
      return {
            ...pokemon.toJSON(), ...updatePokemonDto
      } ;
      
    } catch (error) {
      
        this.handlerExceptions(error);

    }
  }

  async remove(id: string) {
   
    const pokemon = await this.findOne(id)
    await pokemon.deleteOne();

  }

  async removeByMongoId(id: string) {
   
  //  const result = await this.pokemonModel.findByIdAndDelete(id);
  const { deletedCount } = await this.pokemonModel.deleteOne({_id: id});
   if(deletedCount === 0) throw new HttpException(`Id: ${id},  no encontrado`, HttpStatus.NOT_FOUND);

   return{
        msg: 'Registro eliminado'
   };

  }


 private handlerExceptions(error:any):void {

    if (error.code === 11000){
      throw new HttpException(`Pokemon ya existe ${ JSON.stringify( error.keyValue ) }`, HttpStatus.CONFLICT) ;
    }
    console.log('Error : ', error);
    throw new HttpException(`Error inesperado, hable con el administrador.`, HttpStatus.INTERNAL_SERVER_ERROR);

  }

}
