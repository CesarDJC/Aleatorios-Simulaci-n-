export interface Producto{
    id:number;
    nombre:string;
    costoOperativo?:number;
    precioCosto:number;
}

export const PRODUCTOS_DB: Producto[] = [
  { id: 1, nombre: 'Café Americano', precioCosto: 15.00 },
  { id: 2, nombre: 'Capuchino', precioCosto: 22.50 },
  { id: 3, nombre: 'Muffin de Arándanos', precioCosto: 12.00, costoOperativo:5 },
  { id: 4, nombre: 'Sándwich de Jamón', precioCosto: 8.00,  },
  { id: 5, nombre: 'Té Verde', precioCosto: 10.00 },
  { id: 6, nombre: 'Pastel de Chocolate', precioCosto: 18.00 }
];