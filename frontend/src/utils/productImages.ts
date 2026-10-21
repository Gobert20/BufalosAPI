/**
 * Utilidad de imágenes tácticas y mapeo de iconos para Búfalos Táctico.
 * Proporciona imágenes fotográficas de alta calidad y badges vectoriales
 * según la categoría y el nombre del producto.
 */

export interface ProductVisualData {
  imageUrl: string;
  categoryName: string;
  badgeColor: string;
  iconName: string;
}

// Mapa de imágenes fotográficas tácticas de alta definición (optimizadas Unsplash CDN)
const TACTICAL_IMAGE_MAP: { keywords: string[]; url: string }[] = [
  // Airsoft y Réplicas
  {
    keywords: ['fusil', 'm4', 'm4a1', 'aeg', 'rifle'],
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['glock', 'pistola airsoft', 'gbb', 'blowback', 'umarex'],
    url: 'https://images.unsplash.com/photo-1585589074491-3c1bb415977e?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['sniper', 'l96', 'francotirador'],
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['mp5', 'subfusil', 'cyma'],
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['balines', 'bbs', 'biodegradables'],
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['green gas', 'gas puff', 'lubricado'],
    url: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['batería', 'lipo', 'bateria'],
    url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['máscara', 'mascara', 'malla metálica'],
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['granada'],
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  },

  // Calzado y Vestuario Táctico
  {
    keywords: ['bates', 'botas', 'calzado'],
    url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['pantalón', 'pantalon', 'ripstop', 'cargo'],
    url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['camisa', 'shirt', 'combat'],
    url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['guantes', 'anticorte'],
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['cinturón', 'cinturon', 'cobra'],
    url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['chaqueta', 'softshell', 'impermeable'],
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['chaleco', 'molle', 'porta-placas'],
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['casco', 'kevlar'],
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['pasamontañas', 'balaclava'],
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['rodilleras', 'coderas'],
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  },

  // Accesorios y Óptica
  {
    keywords: ['mochila', 'assault', 'trauma bag', 'médica'],
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['mira', 'red dot', 'telescópica', 'óptica', 'optica'],
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['linterna', 'lúmenes', 'picatinny'],
    url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['binoculares', 'mil-dot'],
    url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['torniquete', 'cat gen', 'primeros auxilios'],
    url: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['lentes', 'balísticos', 'wiley-x', 'gafas'],
    url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['funda', 'holster', 'pistolera'],
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
  },

  // Defensa Personal
  {
    keywords: ['traumática', 'traumatica', 'ekol', 'revolver'],
    url: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['taser', 'eléctrica', 'electroshock'],
    url: 'https://images.unsplash.com/photo-1584824486516-0555a07fc511?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['gas pimienta', 'sabre red', 'spray'],
    url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['bastón', 'baston', 'retráctil', 'acero'],
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['alarma', 'sonora', 'antiasalto'],
    url: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['manopla', 'resina'],
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
  },

  // Parches y Personalización
  {
    keywords: ['parche', 'velcro', 'búfalo', 'chile', 'sanguíneo', 'ir'],
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['paracord', 'cuerda'],
    url: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=600&q=80',
  },
  {
    keywords: ['dog tags', 'placas'],
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
  },
];

// Fallback por defecto según Id_Categoria
const CATEGORY_FALLBACK_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80', // Vestuario & Calzado
  2: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Accesorios & Óptica
  3: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80', // Defensa Personal
  4: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80', // Parches
  5: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80', // Airsoft
};

/**
 * Obtiene la URL de imagen más adecuada para un producto según su imagenUrl personalizada,
 * o bien según su nombre y categoría táctica.
 */
export function getProductImageUrl(
  nombre: string,
  categoriaId: number,
  imagenUrl?: string | null
): string {
  if (imagenUrl && typeof imagenUrl === 'string' && imagenUrl.trim().length > 0) {
    const trimmed = imagenUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      const apiBase = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL || 'http://localhost:51800/api/v1';
      try {
        const origin = new URL(apiBase).origin;
        return `${origin}${trimmed}`;
      } catch {
        return `http://localhost:51800${trimmed}`;
      }
    }
    return trimmed;
  }

  const cleanName = (nombre || '').toLowerCase();

  for (const entry of TACTICAL_IMAGE_MAP) {
    if (entry.keywords.some((kw) => cleanName.includes(kw))) {
      return entry.url;
    }
  }

  return (
    CATEGORY_FALLBACK_IMAGES[categoriaId] ||
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80'
  );
}

/**
 * Retorna el emoji o símbolo temático correspondiente a la categoría.
 */
export function getCategorySymbol(categoriaId: number): string {
  switch (categoriaId) {
    case 1:
      return '🥾'; // Vestuario / Botas
    case 2:
      return '🔭'; // Accesorios / Óptica
    case 3:
      return '⚡'; // Defensa Personal
    case 4:
      return '🏷️'; // Parches
    case 5:
      return '🎯'; // Airsoft
    default:
      return '🛡️';
  }
}
