import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';

function HeroBlock({ content }) {
  return (
    <div
      className="relative bg-blue-600 text-white py-20 px-4"
      style={content.image_url ? {
        backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${content.image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : {}}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-4">{content.title}</h1>
        <p className="text-xl">{content.subtitle}</p>
      </div>
    </div>
  );
}

function ServicesBlock({ content, services, businessSlug }) {
  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{content.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
            >
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <div className="flex justify-between items-center text-gray-600 mb-4">
                  <span>⏱️ {service.duration_minutes} min</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${parseFloat(service.price).toFixed(2)}
                  </span>
                </div>
                <a
                  href={`/${businessSlug}/reservar?service=${service.id}`}
                  className="block text-center mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Reservar
                </a>
              </div>
            </div>
          ))}
        </div>
        {services.length === 0 && (
          <p className="text-center text-gray-600">No hay servicios disponibles en este momento.</p>
        )}
      </div>
    </div>
  );
}

function AboutBlock({ content }) {
  return (
    <div className="py-16 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-8">{content.title}</h2>
        <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
          {content.text}
        </p>
      </div>
    </div>
  );
}

function ContactBlock({ content }) {
  return (
    <div className="py-16 px-4 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">{content.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {content.phone && (
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📞</div>
              <h3 className="font-semibold mb-2">Teléfono</h3>
              <p className="text-gray-700">{content.phone}</p>
            </div>
          )}
          {content.email && (
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📧</div>
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-gray-700">{content.email}</p>
            </div>
          )}
          {content.address && (
            <div className="p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">📍</div>
              <h3 className="font-semibold mb-2">Dirección</h3>
              <p className="text-gray-700">{content.address}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/businesses/slug/${slug}`);
        setBusiness(response.data);
      } catch (err) {
        setError(err?.response?.data?.message || 'Negocio no encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const blocks = business.page?.blocks || [];
  const services = business.services || [];

  return (
    <div className="min-h-screen">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'hero':
            return <HeroBlock key={block.id || idx} content={block.content} />;
          case 'services':
            return (
              <ServicesBlock 
                key={block.id || idx} 
                content={block.content} 
                services={services}
                businessSlug={business.slug}
              />
            );
          case 'about':
            return <AboutBlock key={block.id || idx} content={block.content} />;
          case 'contact':
            return <ContactBlock key={block.id || idx} content={block.content} />;
          default:
            return null;
        }
      })}

      {blocks.length === 0 && (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{business.name}</h1>
            <p className="text-gray-600">{business.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}