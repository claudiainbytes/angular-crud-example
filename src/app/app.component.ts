import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ProductosService } from './productos.service';
import { Producto } from './producto';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'ng-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  
  /* Estas variables corresponden a las propiedades del componente. 
  Podemos verlas en la plantilla app.component.html renderizandola con doble llave {{title}} */

  public title = 'Productos';
  public index: number = 0; //Permite incrementar el número de items
  public statusCode: number = 0; //Retorna un código de estado según respuesta del servicio HTTP
  public processValidation = false; //Define si se ha procesado el formulario
  public productoIdToUpdate = null; //Almacena el id del producto en caso de actualizarse
  public requestProcessing = false; //Define si o no se esta procesando información 
  
  public allProductos: Producto[]; //Array que contiene todos los productos

  // En el constructor siempre inicializaremos el servicio 
  constructor(private productosService: ProductosService) {
  }

  // Este objeto de tipo FormGroup permite la definicion de campos del formulario y
  // sus reglas de validacion
  productoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    price: new FormControl('', Validators.required),
    imagelink: new FormControl('', Validators.required),	   
  });

  //Creamos ngOnInit() y cargamos productos con getAllProductos()
  ngOnInit(): void {
       this.getAllProductos();
  }   

  // Obtener todos los productos 
  // this.productosService.getAllProductos() retorna un Observable que retornan muchos valores(data y errorCode)
  // El Observable trae los datos de forma asincrona por medio del metodo .subscribe
  // Fijese que para almacenar en el array allProductos debemos realizar un ciclo donde se almacene
  // la llave de cada registro de Productos y demas propiedades provenientes de Firebase.
  getAllProductos() {
       this.allProductos = [];
       this.productosService.getAllProductos()
            .subscribe(
                data => { 
                          for ( let key$ in data) {
                            let p = data[key$];
                            p.$key = key$;
                            this.allProductos.push(data[key$]);
                         }
                        }, 
                errorCode =>  this.statusCode = errorCode
              ) 
  }

  // Reglas CSS para validacion del campo de formulario, esta se incorpora en la plantilla 
  // [ngClass]="{'error': validarCampo('name') }"
  validarCampo(field: string) {
    return this.productoForm.get(field).invalid && this.processValidation;
  }

  // Espera mientras se procesan los datos
  // Mientras que requestProcessing sea verdadero, se actiav el spinner 
  preProcessConfigurations() {
      this.statusCode = 0;
      this.requestProcessing = true;
  }

  // En caso de Cancelar, resetea el formulario y deja variables en estado original
  backToCrearProducto() {
    this.productoIdToUpdate = null;
    this.productoForm.reset();	  
    this.processValidation = false;
  }

  // Edita un producto a partir de su id
  // Podemos interactuar con el formulario usado el metodo
  // this.productoForm.setValue({..}) que pone los datos en cada campo
  editarProducto(productoId: string) {
    this.preProcessConfigurations();
    this.productosService.getProductoById(productoId)
      .subscribe(producto => {
                this.productoIdToUpdate = productoId;   
                this.productoForm.setValue({ name: producto.name, price: producto.price, imagelink: producto.imagelink });
                this.processValidation = true;
		            this.requestProcessing = false;  
      },
      errorCode =>  this.statusCode = errorCode);   
  }

 //Borrar producto a partir de su id.
 borrarProducto(productoId: string) {
    this.preProcessConfigurations();
    this.productosService.eliminarProducto(productoId)
      .subscribe(successCode => {
        this.statusCode = 204;
        this.getAllProductos();	
        this.backToCrearProducto();
      },
      errorCode => this.statusCode = errorCode);    
}

//Al invocar el evento click desde el template se ejecuta esta funcion
onProductoFormSubmit() {
  this.processValidation = true;
  this.requestProcessing = false;   
  if (this.productoForm.invalid) {
        return; //No cumple la validación, no permite el envio de datos
  }   
  //Form is valid, now perform create or update
  this.preProcessConfigurations();
  let producto = this.productoForm.value;
  if (this.productoIdToUpdate === null) {  
      // Crear Producto		    
      this.productosService.crearProducto(producto)
      .subscribe(successCode => {
            this.statusCode = successCode;
            this.getAllProductos();	
            this.backToCrearProducto();
          },
          errorCode => this.statusCode = errorCode
      );

  } else {  
      // Actualizar Producto	
      this.productosService.actualizarProducto(producto, this.productoIdToUpdate)
        .subscribe(successCode => {
          this.statusCode = successCode;
          this.getAllProductos();	
          this.backToCrearProducto();
        },
        errorCode => this.statusCode = errorCode);	  
    }
  }


}
