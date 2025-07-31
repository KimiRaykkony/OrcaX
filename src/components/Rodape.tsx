import React from 'react';
import { BsWhatsapp, BsInstagram } from 'react-icons/bs';

export const Rodape: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#fff',
        color: '#000',
        padding: '30px 20px',
        fontFamily: "'Raleway', sans-serif",
        borderTop: '1px solid #ddd',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20,
        }}
      >
        {/* Logo */}
        <div style={{ flex: 1, minWidth: 200, textAlign: 'center' }}>
          <img
            src="https://i.ibb.co/W4fh255z/Vision-X-Fundo-Preto.png"
            alt="VisionX Logo"
            style={{ maxWidth: 150, height: 'auto' }}
          />
        </div>

        {/* Informações (centralizado) */}
        <div
          style={{
            flex: 1,
            minWidth: 200,
            textAlign: 'center',
            fontSize: 14,
            lineHeight: 1.5,
            whiteSpace: 'pre-line', // para respeitar quebras de linha no texto
          }}
        >
          <p>
            {`CNPJ: 61.427.918/0001-06

Rodovia MA-381 KM 0, SN
Bairro Diogo, Pedreiras - MA

Email: `}
            <a
              href="mailto:visionxma@gmail.com"
              style={{ color: '#000', textDecoration: 'underline' }}
            >
              visionxma@gmail.com
            </a>
          </p>
        </div>

        {/* Contatos */}
        <div style={{ flex: 1, minWidth: 200, textAlign: 'center', fontSize: 14 }}>
          <p>
            <a
              href="https://wa.me/559984680391"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#000',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <BsWhatsapp size={18} />
              WhatsApp
            </a>
          </p>
          <p>
            <a
              href="https://instagram.com/visionx.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#000',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <BsInstagram size={18} />
              @visionx.dev
            </a>
          </p>
        </div>
      </div>

      <p
        style={{
          textAlign: 'center',
          marginTop: 30,
          fontSize: 13,
          color: '#666',
        }}
      >
        © 2025 VisionX. Todos os direitos reservados.
      </p>
    </footer>
  );
};
