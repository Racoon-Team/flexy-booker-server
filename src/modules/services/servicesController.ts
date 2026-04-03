import { Request, Response } from "express";

export const getServices = async (req: Request, res: Response) => {
  try {
    const servicios = [
      {
        id: 1,
        nombre: "Consultoría IT",
        descripcion: "Mantenimiento en infraestructuras.",
        fecha: "15/07/2024",
        hora: "10:00 AM - 12:00 PM",
      },
      {
        id: 2,
        nombre: "Corte de Cabello",
        descripcion: "Corte y estilo para caballeros.",
        fecha: "16/07/2024",
        hora: "02:00 PM - 05:00 PM",
      },
    ];

    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener servicios" });
  }
};
