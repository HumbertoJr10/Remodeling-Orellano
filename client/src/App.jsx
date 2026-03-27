import { useEffect, useMemo, useState } from 'react'
import './App.css'

const videoModules = import.meta.glob('./assets/videos/*.mp4', {
  eager: true,
  query: '?url',
  import: 'default',
})

const projectVideos = Object.entries(videoModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url)

export function AdminMessagesView({ apiUrl, companyName }) {
  const [password, setPassword] = useState('')
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authError, setAuthError] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [deletingId, setDeletingId] = useState('')

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

  useEffect(() => {
    if (!isAuthorized) return

    fetchMessages()
  }, [apiUrl, isAuthorized])

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

  const handleDeleteMessage = async (id) => {
    try {
      setDeletingId(id)
      const response = await fetch(`${apiUrl}/messages/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Delete failed')
      setMessages((prev) => prev.filter((message) => message.id !== id))
    } catch (error) {
      setLoadError('Could not delete message.')
    } finally {
      setDeletingId('')
    }
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
    <main className="admin-page">
      <section className="admin-card admin-messages">
        <h1>{companyName}</h1>
        <h2>Inbox Messages</h2>
        {loading && <p>Loading messages...</p>}
        {loadError && <p className="admin-error">{loadError}</p>}
        {!loading && !loadError && messages.length === 0 && (
          <p>No messages yet.</p>
        )}
        {!loading && !loadError && messages.length > 0 && (
          <div className="messages-table-wrap">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date</th>
                  <th>Message</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{message.phone || '-'}</td>
                    <td>{new Date(message.createdAt).toLocaleString()}</td>
                    <td className="table-message-cell">{message.message}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={deletingId === message.id}
                      >
                        {deletingId === message.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}

function App() {
  const [language, setLanguage] = useState('en')
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })

  const companyName = 'RCO HIGH LEVEL CONSTRUCTION LLC - Orellano'

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

  const goToPrevVideo = () => {
    if (!projectVideos.length) return
    setActiveVideoIndex((prev) => (prev - 1 + projectVideos.length) % projectVideos.length)
  }

  const goToNextVideo = () => {
    if (!projectVideos.length) return
    setActiveVideoIndex((prev) => (prev + 1) % projectVideos.length)
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
              {projectVideos.length > 0 ? (
                <>
                  <button type="button" className="carousel-control prev" onClick={goToPrevVideo}>
                    ‹
                  </button>
                  <video
                    key={projectVideos[activeVideoIndex]}
                    className="project-video"
                    src={projectVideos[activeVideoIndex]}
                    controls
                    preload="metadata"
                  />
                  <button type="button" className="carousel-control next" onClick={goToNextVideo}>
                    ›
                  </button>
                  <div className="carousel-dots">
                    {projectVideos.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        type="button"
                        className={`dot ${index === activeVideoIndex ? 'active' : ''}`}
                        onClick={() => setActiveVideoIndex(index)}
                        aria-label={`Go to project video ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p>No project videos found in assets/videos.</p>
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
