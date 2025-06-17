'use client';
import { useEffect, useRef, useState } from 'react';
import './style.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Home() {
  const [mostrarIntro, setMostrarIntro] = useState(false);
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarCarnet, setMostrarCarnet] = useState(false);
  const [imagenes, setImagenes] = useState<any>(null);
  const [id, setId] = useState('');
  const [datos, setDatos] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const manejarInicio = () => setMostrarIntro(true);

  useEffect(() => {
    if (mostrarIntro && videoRef.current) {
      videoRef.current.play();
      videoRef.current.onended = () => {
        setMostrarIntro(false);
        setMostrarLogin(true);
      };
    }
  }, [mostrarIntro]);

  const manejarVerCarnet = async () => {
    if (id.trim() === '') return;

    const basePath = `/usuarios/${id}`;

    setImagenes({
      carnet: `${basePath}/carnetoff.png`,
      ceo: `${basePath}/ceo.png`,
      insigniasl: `${basePath}/insigniasl.png`,
      insigniasr: `${basePath}/insigniasr.png`,
    });

    try {
      const res = await fetch(`${basePath}/datos.json`);
      const json = await res.json();
      setDatos(json);
      setMostrarLogin(false);
      setMostrarCarnet(true);
    } catch (err) {
      alert('❌ No se encontraron los datos del usuario');
    }
  };

const descargarCarnetImagen = () => {
  const link = document.createElement('a');
  link.href = `/usuarios/${id}/carnetoff.png`;
  link.download = 'carnet.png';
  link.click();
};

const descargarCarnetPDF = () => {
  const img = new Image();
  img.src = `/usuarios/${id}/carnetoff.png`;

  img.onload = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Ajustar al alto disponible
    const imgHeight = pageHeight;
    const imgWidth = (img.width * imgHeight) / img.height;

    const x = (pageWidth - imgWidth) / 2;

    pdf.addImage(img, 'PNG', x, 0, imgWidth, imgHeight);
    pdf.save('carnet.pdf');
  };
};



  const descargarExamen = (tipo: 'a' | 'b') => {
    const fileUrl = `/usuarios/${id}/examen_${tipo}.pdf`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `examen_${tipo}.pdf`;
    link.click();

    const tooltip = document.getElementById(`tooltip-${tipo}`);
    if (tooltip) {
      tooltip.classList.add('visible');
      setTimeout(() => tooltip.classList.remove('visible'), 2000);
    }
  };

  const notaA = datos?.notaA || 0;
  const notaB = datos?.notaB || 0;
  const notaFinal = Math.round((notaA + notaB) / 2);
  const caducidad = datos?.caducidad || 'Desconocida';
  const hb = datos?.hb || 'Desconocida';
  const categoria = datos?.categoria || 'N/A';

  return (
    <main className="main-container">
      <video autoPlay loop muted className="background-video">
        <source src="/background.mp4" type="video/mp4" />
      </video>

      {!mostrarIntro && !mostrarLogin && !mostrarCarnet && (
        <button className="intro-button" onClick={manejarInicio}>
          <img src="/logo.png" alt="Logo" className="logo" />
        </button>
      )}

      {mostrarIntro && (
        <div className="intro-video-container fade-out">
          <video
            ref={videoRef}
            className="intro-video"
            src="/intro.mp4"
            autoPlay
            playsInline
            muted={false}
            controls={false}
          />
        </div>
      )}

      {mostrarLogin && (
        <div className="login-container fade-in-up">
          <div className="login-header">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h1 className="login-title">Login</h1>
          </div>
          <input
            className="input-id"
            type="text"
            placeholder="Ingresa tu ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
          <button className="glass-button" onClick={manejarVerCarnet}>
            Ver carnet
          </button>
        </div>
      )}

      {mostrarCarnet && imagenes && datos && (
        <>
          <div className="carnet-container fade-in-up">
            <div className="carnet-left">
              <img src={imagenes.carnet} alt="Carnet" className="carnet-img" />
              <div className="button-group">
                <button className="glass-button download-button" onClick={descargarCarnetImagen}>
                  Descargar Imagen
                </button>
                <button className="glass-button download-button" onClick={descargarCarnetPDF}>
                  Descargar PDF
                </button>
              </div>
            </div>

            <div className="carnet-right glass-panel">
              <h2 className="section-title">Resumen del Usuario</h2>

              <div className="exam-row">
                <span>Examen A</span>
                <div className="glass-grade green hover-scale" onClick={() => descargarExamen('a')} style={{ cursor: 'pointer' }}>
                  {notaA}
                </div>
                <span id="tooltip-a" className="glass-tooltip">📄 Examen A descargado</span>
              </div>

              <div className="exam-row">
                <span>Examen B</span>
                <div className="glass-grade green hover-scale" onClick={() => descargarExamen('b')} style={{ cursor: 'pointer' }}>
                  {notaB}
                </div>
                <span id="tooltip-b" className="glass-tooltip">📄 Examen B descargado</span>
              </div>

              <div className="exam-row">
                <span>Nota Final</span>
                <div className="glass-grade green hover-scale">{notaFinal}</div>
              </div>

              <h3 className="section-subtitle">Contrato</h3>
              <div className="contract-status">
                <div className="glass-contract green">
                  Activo <div className="pulsating-circle inside"></div>
                </div>
              </div>

              <div className="contract-status">
                <div className="glass-contract red">Caducidad: {caducidad}</div>
              </div>

              <div className="contract-status">
                <div className="glass-contract yellow">
                  <span style={{ color: '#FFFFFF', fontWeight: 'bold' }}>HB: {hb}</span>
                </div>
              </div>

              <h3 className="section-subtitle">Categoría</h3>
              <div className="glass-category center-content">
                <img src={imagenes.ceo} alt="CEO" className="ceo-img" />
                <strong>{categoria}</strong>
              </div>
            </div>
          </div>

          <div className="dual-insignias-container">
            <img src={imagenes.insigniasl} alt="Insignias Izquierda" className="dual-insignias-img" />
            <img src={imagenes.insigniasr} alt="Insignias Derecha" className="dual-insignias-img" />
          </div>
        </>
      )}

      <footer className="copyright-footer">
        © Nexus / Creator: Ocho - Renato V. 2025
      </footer>
    </main>
  );
}
