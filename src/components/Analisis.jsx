import React, { useEffect, useState } from "react";
import { analytics } from "../firebase";

const Analisis = () => {
  const [usoApp, setUsoApp] = useState([]);

  useEffect(() => {
    // Obtener los eventos de uso de la aplicación
    const obtenerDatosUsoApp = async () => {
      try {
        const response = await analytics.getApps();

        // Obtener el primer y único elemento del arreglo de apps
        const app = response.apps[0];

        // Obtener los datos de uso de la aplicación
        const data = await analytics.getBigQueryRecords({
          projectId: app.projectId,
          datasetId: "app_usage",
          tableId: "app_events",
          maxResults: 10, // Cantidad de registros a obtener
        });

        setUsoApp(data.records);
      } catch (error) {
        console.error("Error al obtener los datos de uso de la aplicación", error);
      }
    };

    obtenerDatosUsoApp();
  }, []);

  return (
    <>
      <h2>Tabla de uso de la aplicación</h2>
      <table>
        <thead>
          <tr>
            <th>Evento</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {usoApp.map((registro, index) => (
            <tr key={index}>
              <td>{registro.event}</td>
              <td>{registro.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default Analisis;
