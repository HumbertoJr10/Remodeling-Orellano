import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import './App.css'

export function AdminLayout({ apiUrl, companyName }) {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    document.title = `${companyName} | Admin`
  }, [companyName])

  const handlePasswordSubmit = (event) => {
    event.preventDefault()
    if (password === 'admin99') {
      setIsAuthorized(true)
      setAuthError('')
      return
    }
    setAuthError('Invalid password')
  }

  if (!isAuthorized) {
    return (
      <main className="admin-page">
        <section className="admin-card">
          <h1>{companyName}</h1>
          <h2>Admin Access</h2>
          <p>Enter password to view contact messages.</p>
          <form onSubmit={handlePasswordSubmit} className="admin-form">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
            <button type="submit" className="btn btn-primary">Enter</button>
            {authError && <p className="admin-error">{authError}</p>}
          </form>
        </section>
      </main>
    )
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">Admin</div>
        <nav className="admin-sidebar-nav">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? ' active' : ''}`
            }
          >
            Messages
          </NavLink>
          <NavLink
            to="/admin/carousel"
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? ' active' : ''}`
            }
          >
            Carrusel
          </NavLink>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}

export function AdminMessagesPanel({ apiUrl, companyName }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [deletingId, setDeletingId] = useState('')
  const [patchingId, setPatchingId] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [actionsMenu, setActionsMenu] = useState(null)

  useEffect(() => {
    if (!actionsMenu) return undefined
    const close = () => setActionsMenu(null)
    const onScrollOrResize = () => close()
    window.addEventListener('scroll', onScrollOrResize, true)
    window.addEventListener('resize', onScrollOrResize)
    const onDocMouseDown = (event) => {
      if (event.target.closest('[data-admin-actions-root]')) return
      close()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true)
      window.removeEventListener('resize', onScrollOrResize)
      document.removeEventListener('mousedown', onDocMouseDown)
    }
  }, [actionsMenu])

  useEffect(() => {
    fetchMessages()
  }, [apiUrl])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const response = await fetch(`${apiUrl}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      setLoadError('Could not load messages from API.')
    } finally {
      setLoading(false)
    }
  }

  const updateMessageView = async (id, view) => {
    try {
      setPatchingId(id)
      const response = await fetch(`${apiUrl}/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ view }),
      })
      if (!response.ok) throw new Error('Update failed')
      const updated = await response.json()
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      )
      setSelectedMessage((prev) =>
        prev && prev.id === id ? { ...prev, ...updated } : prev,
      )
    } catch (error) {
      setLoadError('Could not update message.')
    } finally {
      setPatchingId('')
    }
  }

  const openMessage = (message) => {
    setSelectedMessage(message)
    if (!message.view) {
      updateMessageView(message.id, true)
    }
  }

  const handleMarkAsRead = (id) => {
    updateMessageView(id, true)
  }

  const handleDeleteMessage = async (id) => {
    try {
      setDeletingId(id)
      const response = await fetch(`${apiUrl}/messages/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Delete failed')
      setMessages((prev) => prev.filter((message) => message.id !== id))
      setSelectedMessage((prev) => (prev && prev.id === id ? null : prev))
    } catch (error) {
      setLoadError('Could not delete message.')
    } finally {
      setDeletingId('')
    }
  }

  const toggleActionsMenu = (message, event) => {
    event.stopPropagation()
    const rect = event.currentTarget.getBoundingClientRect()
    setActionsMenu((prev) =>
      prev?.messageId === message.id
        ? null
        : { messageId: message.id, top: rect.bottom + 4, left: rect.left },
    )
  }

  const menuMessage =
    actionsMenu &&
    messages.find((m) => m.id === actionsMenu.messageId)

  return (
    <>
      <section className="admin-card admin-messages">
        <h1 className="admin-main-title">{companyName}</h1>
        <h2>Mensajes</h2>
        {loading && <p>Loading messages...</p>}
        {loadError && <p className="admin-error">{loadError}</p>}
        {!loading && !loadError && messages.length === 0 && (
          <p>No hay mensajes todavía.</p>
        )}
        {!loading && !loadError && messages.length > 0 && (
          <div className="messages-table-wrap">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr
                    key={message.id}
                    className={
                      message.view ? 'message-row-read' : 'message-row-unread'
                    }
                  >
                    <td>
                      {message.view ? (
                        <span className="badge badge-read">Leído</span>
                      ) : (
                        <span className="badge badge-unread">No leído</span>
                      )}
                    </td>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{new Date(message.createdAt).toLocaleString()}</td>
                    <td className="table-actions-cell">
                      <div
                        className="admin-actions-dropdown"
                        data-admin-actions-root
                      >
                        <button
                          type="button"
                          className="admin-actions-trigger"
                          aria-expanded={actionsMenu?.messageId === message.id}
                          aria-haspopup="menu"
                          onClick={(e) => toggleActionsMenu(message, e)}
                        >
                          Acciones
                          <span className="admin-actions-caret" aria-hidden>
                            ▾
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {menuMessage && actionsMenu && (
        <ul
          className="admin-actions-dropdown-menu"
          data-admin-actions-root
          role="menu"
          style={{
            position: 'fixed',
            top: actionsMenu.top,
            left: actionsMenu.left,
            zIndex: 2000,
          }}
        >
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="admin-actions-menu-item"
              onClick={() => {
                openMessage(menuMessage)
                setActionsMenu(null)
              }}
            >
              Abrir
            </button>
          </li>
          {!menuMessage.view && (
            <li role="none">
              <button
                type="button"
                role="menuitem"
                className="admin-actions-menu-item"
                disabled={patchingId === menuMessage.id}
                onClick={() => {
                  handleMarkAsRead(menuMessage.id)
                  setActionsMenu(null)
                }}
              >
                {patchingId === menuMessage.id ? 'Marcando…' : 'Marcar leído'}
              </button>
            </li>
          )}
          <li role="none">
            <button
              type="button"
              role="menuitem"
              className="admin-actions-menu-item admin-actions-menu-item-danger"
              disabled={deletingId === menuMessage.id}
              onClick={() => {
                handleDeleteMessage(menuMessage.id)
                setActionsMenu(null)
              }}
            >
              {deletingId === menuMessage.id ? 'Eliminando…' : 'Eliminar'}
            </button>
          </li>
        </ul>
      )}

      {selectedMessage && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <h3 id="admin-modal-title">Mensaje</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setSelectedMessage(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="admin-modal-body">
              <p>
                <strong>De:</strong> {selectedMessage.name} —{' '}
                {selectedMessage.email}
              </p>
              {selectedMessage.phone && (
                <p>
                  <strong>Teléfono:</strong> {selectedMessage.phone}
                </p>
              )}
              <p>
                <strong>Fecha:</strong>{' '}
                {new Date(selectedMessage.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Estado:</strong>{' '}
                {selectedMessage.view ? 'Leído' : 'No leído'}
              </p>
              <div className="admin-modal-message">
                <strong>Mensaje</strong>
                <p>{selectedMessage.message}</p>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSelectedMessage(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function AdminCarouselPanel({ apiUrl, companyName }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [deletingId, setDeletingId] = useState('')

  const loadItems = async () => {
    try {
      setLoading(true)
      setLoadError('')
      const response = await fetch(`${apiUrl}/carousel`)
      if (!response.ok) throw new Error('fetch failed')
      const data = await response.json()
      setItems(data.items || [])
    } catch (e) {
      setLoadError('No se pudo cargar el carrusel.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [apiUrl])

  const handleUpload = async (event) => {
    event.preventDefault()
    const input = event.target.elements.file
    const file = input?.files?.[0]
    if (!file) {
      setUploadError('Selecciona un archivo.')
      return
    }
    try {
      setUploading(true)
      setUploadError('')
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`${apiUrl}/carousel`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Error al subir')
      }
      event.target.reset()
      await loadItems()
    } catch (e) {
      setUploadError(e.message || 'Error al subir.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setDeletingId(id)
      const response = await fetch(`${apiUrl}/carousel/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('delete failed')
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (e) {
      setLoadError('No se pudo eliminar el archivo.')
    } finally {
      setDeletingId('')
    }
  }

  const mediaUrl = (item) => {
    if (item.url.startsWith('http')) return item.url
    return `${apiUrl.replace(/\/$/, '')}${item.url}`
  }

  return (
    <section className="admin-card admin-carousel-panel">
      <h1 className="admin-main-title">{companyName}</h1>
      <h2>Carrusel (inicio)</h2>
      <p className="admin-carousel-hint">
        Sube videos o imágenes. Se mostrarán en el carrusel de la sección Proyectos.
      </p>

      <form className="admin-carousel-upload" onSubmit={handleUpload}>
        <label className="admin-carousel-file-label">
          <span>Archivo</span>
          <input
            name="file"
            type="file"
            accept="image/*,video/*"
            required
            disabled={uploading}
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={uploading}
        >
          {uploading ? 'Subiendo…' : 'Subir'}
        </button>
        {uploadError && <p className="admin-error">{uploadError}</p>}
      </form>

      {loading && <p>Cargando…</p>}
      {loadError && <p className="admin-error">{loadError}</p>}

      {!loading && !loadError && items.length === 0 && (
        <p>No hay archivos en el carrusel todavía.</p>
      )}

      {!loading && items.length > 0 && (
        <ul className="admin-carousel-list">
          {items.map((item) => (
            <li key={item.id} className="admin-carousel-item">
              <div className="admin-carousel-thumb">
                {item.kind === 'video' ? (
                  <video
                    src={mediaUrl(item)}
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img src={mediaUrl(item)} alt="" />
                )}
              </div>
              <div className="admin-carousel-meta">
                <span className="admin-carousel-kind">
                  {item.kind === 'video' ? 'Video' : 'Imagen'}
                </span>
                <span className="admin-carousel-name">{item.fileName}</span>
              </div>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={deletingId === item.id}
                onClick={() => handleDelete(item.id)}
              >
                {deletingId === item.id ? '…' : 'Eliminar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function App() {
  const [language, setLanguage] = useState('en')
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [carouselSlides, setCarouselSlides] = useState([])
  const [carouselLoading, setCarouselLoading] = useState(true)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })

  const companyName = 'RCO HIGH LEVEL CONSTRUCTION LLC'

  useEffect(() => {
    document.title = companyName
  }, [companyName])

  useEffect(() => {
    if (!toast.show) return
    const timeoutId = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }))
    }, 2800)

    return () => clearTimeout(timeoutId)
  }, [toast.show])

  const content = {
    en: {
      nav: {
        home: 'Home',
        services: 'Services',
        projects: 'Projects',
        contact: 'Contact',
      },
      hero: {
        tag: 'Building trust, one home at a time',
        title: 'Your dream home starts here',
        description:
          `At ${companyName}, we turn ideas into real spaces: new home construction, complete remodeling, and premium finishes.`,
        servicesBtn: 'Our services',
        quoteBtn: 'Request a quote',
      },
      sections: {
        servicesTitle: 'Services',
        projectsTitle: 'Projects',
        projectsDescription:
          'We are ready to build or remodel your next home. Every project is managed with clear planning, high-quality materials, and on-time delivery.',
        contactTitle: 'Contact',
      },
      contact: {
        company: 'Company',
        manager: 'Owner',
        phone: 'Phone',
        address: 'Address',
        email: 'Email',
        sendMessage: 'Send us a message',
        fullName: 'Full name',
        yourEmail: 'Your email',
        yourPhone: 'Phone (optional)',
        yourMessage: 'Your message',
        sendBtn: 'Send message',
        sendingBtn: 'Sending...',
        success: 'Message sent successfully. We will contact you soon.',
        error: 'Could not send your message. Please try again.',
      },
      footer: {
        line1: `${companyName} - Home construction and remodeling`,
        line2: 'Serving residential projects and renovations in Minnesota.',
      },
      services: [
        {
          title: 'Residential construction',
          description:
            'We design and build modern, functional homes tailored to your family.',
          image:
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: 'Full-home remodeling',
          description:
            'We renovate interior and exterior spaces to improve comfort and value.',
          image:
            'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: 'Premium finishes',
          description:
            'We deliver high-quality details in flooring, painting, carpentry, and facades.',
          image:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        },
      ],
    },
    es: {
      nav: {
        home: 'Inicio',
        services: 'Servicios',
        projects: 'Proyectos',
        contact: 'Contacto',
      },
      hero: {
        tag: 'Construimos confianza, hogar por hogar',
        title: 'La casa de tus suenos empieza aqui',
        description:
          `En ${companyName} transformamos ideas en espacios reales: construccion de casas nuevas, remodelaciones completas y acabados premium.`,
        servicesBtn: 'Nuestros servicios',
        quoteBtn: 'Solicitar cotizacion',
      },
      sections: {
        servicesTitle: 'Servicios',
        projectsTitle: 'Proyectos',
        projectsDescription:
          'Estamos listos para construir o remodelar tu proximo hogar. Trabajamos cada proyecto con planificacion clara, materiales de calidad y cumplimiento de tiempos.',
        contactTitle: 'Contacto',
      },
      contact: {
        company: 'Empresa',
        manager: 'Responsable',
        phone: 'Telefono',
        address: 'Direccion',
        email: 'Email',
        sendMessage: 'Envianos un mensaje',
        fullName: 'Nombre completo',
        yourEmail: 'Tu correo',
        yourPhone: 'Telefono (opcional)',
        yourMessage: 'Tu mensaje',
        sendBtn: 'Enviar mensaje',
        sendingBtn: 'Enviando...',
        success: 'Mensaje enviado con exito. Te contactaremos pronto.',
        error: 'No se pudo enviar el mensaje. Intentalo nuevamente.',
      },
      footer: {
        line1: `${companyName} - Construccion y remodelacion de casas`,
        line2: 'Atendemos proyectos residenciales y remodelaciones en Minnesota.',
      },
      services: [
        {
          title: 'Construccion residencial',
          description:
            'Disenamos y construimos casas modernas, funcionales y listas para crecer con tu familia.',
          image:
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: 'Remodelacion integral',
          description:
            'Renovamos interiores y exteriores para mejorar distribucion, confort y valor de tu propiedad.',
          image:
            'https://images.unsplash.com/photo-1617103996702-96ff29b1c467?auto=format&fit=crop&w=1200&q=80',
        },
        {
          title: 'Acabados premium',
          description:
            'Trabajamos detalles de alta calidad en pisos, pintura, carpinteria y fachadas.',
          image:
            'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
        },
      ],
    },
  }

  const t = useMemo(() => content[language], [language])
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    `${window.location.protocol}//${window.location.hostname}:3001`

  useEffect(() => {
    let cancelled = false
    const loadCarousel = async () => {
      try {
        setCarouselLoading(true)
        const response = await fetch(`${apiUrl}/carousel`)
        if (!response.ok) throw new Error('carousel fetch failed')
        const data = await response.json()
        const items = data.items || []
        const base = apiUrl.replace(/\/$/, '')
        const slides = items.map((item) => ({
          kind: item.kind,
          src: item.url.startsWith('http') ? item.url : `${base}${item.url}`,
        }))
        if (!cancelled) {
          setCarouselSlides(slides)
          setActiveSlideIndex(0)
        }
      } catch {
        if (!cancelled) setCarouselSlides([])
      } finally {
        if (!cancelled) setCarouselLoading(false)
      }
    }
    loadCarousel()
    return () => {
      cancelled = true
    }
  }, [apiUrl])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setToast({ show: true, type: 'error', message: t.contact.error })
      return
    }

    try {
      setSending(true)

      const response = await fetch(`${apiUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          message: form.message,
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setForm({ name: '', email: '', phone: '', message: '' })
      setToast({ show: true, type: 'success', message: t.contact.success })
    } catch (error) {
      setToast({ show: true, type: 'error', message: t.contact.error })
    } finally {
      setSending(false)
    }
  }

  const goToPrevSlide = () => {
    if (!carouselSlides.length) return
    setActiveSlideIndex(
      (prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length,
    )
  }

  const goToNextSlide = () => {
    if (!carouselSlides.length) return
    setActiveSlideIndex((prev) => (prev + 1) % carouselSlides.length)
  }

  return (
    <div className="page">
      <header id="inicio" className="hero panel">
        <div className="overlay" />

        <nav className="top-nav">
          <div className="brand">{companyName}</div>
          <ul>
            <li><a href="#inicio">{t.nav.home}</a></li>
            <li><a href="#servicios">{t.nav.services}</a></li>
            <li><a href="#proyectos">{t.nav.projects}</a></li>
            <li><a href="#contacto">{t.nav.contact}</a></li>
          </ul>
          <div className="nav-actions">
            <div className="lang-switch">
              <button
                type="button"
                className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`lang-btn ${language === 'es' ? 'active' : ''}`}
                onClick={() => setLanguage('es')}
              >
                ES
              </button>
            </div>
            <div className="phone">+1 (612) 940-4393</div>
          </div>
        </nav>

        <section className="hero-content">
          <p className="tag">{t.hero.tag}</p>
          <h1>{t.hero.title}</h1>
          <p>{t.hero.description}</p>

          <div className="cta-group">
            <a href="#servicios" className="btn btn-primary">{t.hero.servicesBtn}</a>
            <a href="#contacto" className="btn btn-outline">{t.hero.quoteBtn}</a>
          </div>
        </section>
      </header>

      <main>
        <section id="servicios" className="services panel">
          <div className="section-content">
            <h2>{t.sections.servicesTitle}</h2>
            <div className="services-grid">
              {t.services.map((service) => (
                <article key={service.title} className="service-card">
                  <img src={service.image} alt={service.title} />
                  <div className="service-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proyectos" className="projects panel">
          <div className="section-content">
            <h2>{t.sections.projectsTitle}</h2>
            <p>{t.sections.projectsDescription}</p>
            <div className="projects-carousel">
              {carouselLoading && <p>Cargando proyectos…</p>}
              {!carouselLoading && carouselSlides.length > 0 ? (
                <>
                  <button
                    type="button"
                    className="carousel-control prev"
                    onClick={goToPrevSlide}
                  >
                    ‹
                  </button>
                  {carouselSlides[activeSlideIndex].kind === 'video' ? (
                    <video
                      key={carouselSlides[activeSlideIndex].src}
                      className="project-video project-carousel-media"
                      src={carouselSlides[activeSlideIndex].src}
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img
                      key={carouselSlides[activeSlideIndex].src}
                      className="project-video project-carousel-media project-carousel-image"
                      src={carouselSlides[activeSlideIndex].src}
                      alt=""
                    />
                  )}
                  <button
                    type="button"
                    className="carousel-control next"
                    onClick={goToNextSlide}
                  >
                    ›
                  </button>
                  <div className="carousel-dots">
                    {carouselSlides.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        type="button"
                        className={`dot ${index === activeSlideIndex ? 'active' : ''}`}
                        onClick={() => setActiveSlideIndex(index)}
                        aria-label={`Ir al elemento ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
              {!carouselLoading && carouselSlides.length === 0 && (
                <p>No hay imágenes ni videos en el carrusel todavía.</p>
              )}
            </div>
          </div>
        </section>

        <section id="contacto" className="contact panel">
          <div className="section-content">
            <h2>{t.sections.contactTitle}</h2>
            <article className="contact-card contact-unified-card">
              <div className="contact-info-grid">
                <div>
                  <h3>{t.contact.company}</h3>
                  <p>{companyName}</p>
                </div>
                <div>
                  <h3>{t.contact.manager}</h3>
                  <p>Richard</p>
                </div>
                <div>
                  <h3>{t.contact.phone}</h3>
                  <p><a href="tel:+16129404393">+1 (612) 940-4393</a></p>
                </div>
                <div>
                  <h3>{t.contact.address}</h3>
                  <p>8321 6th St NE, MN 55434</p>
                </div>
                <div>
                  <h3>{t.contact.email}</h3>
                  <p><a href="mailto:richarcorrales7@gmail.com">richarcorrales7@gmail.com</a></p>
                </div>
              </div>

              <div className="contact-form-wrapper">
                <h3>{t.contact.sendMessage}</h3>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder={t.contact.fullName}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder={t.contact.yourEmail}
                    required
                  />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder={t.contact.yourPhone}
                  />
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleInputChange}
                    placeholder={t.contact.yourMessage}
                    rows="4"
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={sending}>
                    {sending ? t.contact.sendingBtn : t.contact.sendBtn}
                  </button>
                </form>
              </div>
            </article>
          </div>
        </section>
      </main>

      {toast.show && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>{toast.message}</div>
        </div>
      )}

      <footer className="footer">
        <p>{t.footer.line1}</p>
        <p>{t.footer.line2}</p>
      </footer>
    </div>
  )
}

export default App
