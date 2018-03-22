import { Injectable } from '@angular/core';
import { Http, Response, Headers, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { environment } from './../environments/environment';

import { Producto } from './producto';

@Injectable()
export class ProductosService {

  // URL de origen de los datos en firebase
  // Notese que estan seteados en environment.ts
  private preURL: string = environment.firebase.databaseURL +'/meals';

  // Inicializamos Http para realizar operaciones CRUD
  constructor( private http:Http ) { 
  }
  
  // Trae los datos en formato JSON
  private extraerDatos(res: Response) {
      let body = res.json();
      return body;
  }
  
  // En caso de error retorna un Observable con el codigo de estado
  private gestionarErrores (error: Response | any) {
    console.error(error.message || error);
    return Observable.throw(error.status);
  }

  // Obtener todos productos
  // Definiendo la funcion de tipo observable para que devuelva
  // Los productos
  // En caso de error muestre codigo de error
  // map es un metodo que permite transformar los resultados de un observable
  getAllProductos(): Observable<Producto[]> {
    return this.http.get(this.preURL + '/.json')
            .map(this.extraerDatos)
            .catch(this.gestionarErrores);
  }

  // Trae el producto a partir del id
   getProductoById(id$: string): Observable<Producto> {
    let cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: cpHeaders });
    return this.http.get(this.preURL + `/${id$}/.json`)
       .map(this.extraerDatos)
       .catch(this.gestionarErrores);
  }	

  // Crear producto
  // Definiendo la funcion de tipo observable para que devuelva
  // El codigo de estado de la respuesta del servidor
  // En caso de error muestre codigo de error
  crearProducto(producto: Producto): Observable<number> {
    let cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: cpHeaders });
          return this.http.post(this.preURL + '.json', producto, options)
                 .map(success => success.status)
                 .catch(this.gestionarErrores);
  }

  // Actualizar Producto
  actualizarProducto(producto: Producto, key$: string): Observable<number> {
    let cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: cpHeaders });
          return this.http.put(`${this.preURL}/${key$}/.json`, producto, options)
                 .map(success => success.status)
                 .catch(this.gestionarErrores);
  }

   // Eliminar Producto
   eliminarProducto(key$: string): Observable<number> {
    let cpHeaders = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: cpHeaders });
          return this.http.delete(`${this.preURL}/${key$}/.json`, options)
                 .map(success => success.status)
                 .catch(this.gestionarErrores);
  }

}
