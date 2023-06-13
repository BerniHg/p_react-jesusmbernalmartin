import React from "react";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="not-found-page">
      <h1 className="not-found-page__title">404 - Página no encontrada</h1>
      <p className="not-found-page__message">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <p className="not-found-page__link" onClick={goBack}>
        Volver a la página anterior
      </p>
    </div>
  );
};

export default NotFoundPage;