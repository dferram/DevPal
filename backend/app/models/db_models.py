from sqlalchemy import (
    Column, String, Integer, Boolean, Text, Date, Time,
    ForeignKey, CheckConstraint, UniqueConstraint, Index, Numeric
)
from sqlalchemy.dialects.postgresql import UUID, JSONB, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from uuid import uuid4
from app.database import Base


class PerfilUsuario(Base):
    __tablename__ = "perfiles_usuario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, unique=True)
    nivel = Column(Integer, default=1, nullable=False)
    racha_dias = Column(Integer, default=0, nullable=False)
    eventos_asistidos = Column(Integer, default=0, nullable=False)
    certificados = Column(Integer, default=0, nullable=False)
    logros = Column(Integer, default=0, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('nivel >= 1', name='check_nivel_positivo'),
        CheckConstraint('racha_dias >= 0', name='check_racha_positiva'),
        CheckConstraint('eventos_asistidos >= 0', name='check_eventos_positivo'),
        CheckConstraint('certificados >= 0', name='check_certificados_positivo'),
        CheckConstraint('logros >= 0', name='check_logros_positivo'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="perfil")


class InteresUsuario(Base):
    __tablename__ = "intereses_usuario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    interes = Column(String(100), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'interes', name='unique_usuario_interes'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="intereses")


class LenguajeUsuario(Base):
    __tablename__ = "lenguajes_usuario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    lenguaje = Column(String(100), nullable=False)
    nivel = Column(String(50), default='Principiante', nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'lenguaje', name='unique_usuario_lenguaje'),
        CheckConstraint("nivel IN ('Principiante', 'Intermedio', 'Avanzado')", name='check_nivel_valido'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="lenguajes")


class Evento(Base):
    __tablename__ = "eventos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text, nullable=True)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    ubicacion = Column(String(255), nullable=True)
    categoria = Column(String(50), nullable=False)
    imagen_url = Column(Text, nullable=True)
    cupos_disponibles = Column(Integer, default=100)
    es_popular = Column(Boolean, default=False)
    organizador = Column(String(255), nullable=True)
    url_externa = Column(Text, nullable=True)
    latitud = Column(Numeric(10, 8), nullable=True)
    longitud = Column(Numeric(11, 8), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        CheckConstraint('cupos_disponibles >= 0', name='check_cupos_positivo'),
        CheckConstraint("categoria IN ('Hackathon', 'Conferencia', 'Taller', 'Concurso', 'Meetup')", name='check_categoria_valida'),
        UniqueConstraint('titulo', 'fecha', 'ubicacion', name='unique_evento'),
    )
    
    eventos_guardados = relationship(lambda: EventoGuardado, back_populates="evento", cascade="all, delete-orphan")
    usuario_eventos = relationship(lambda: UsuarioEvento, back_populates="evento", cascade="all, delete-orphan")


class EventoGuardado(Base):
    __tablename__ = "eventos_guardados"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    evento_id = Column(UUID(as_uuid=True), ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'evento_id', name='unique_usuario_evento_guardado'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="eventos_guardados")
    evento = relationship(lambda: Evento, back_populates="eventos_guardados")


class UsuarioEvento(Base):
    __tablename__ = "usuario_eventos"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    evento_id = Column(UUID(as_uuid=True), ForeignKey("eventos.id", ondelete="CASCADE"), nullable=False)
    estado = Column(String(50), default='Registrado', nullable=False)
    certificado_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'evento_id', name='unique_usuario_evento_participacion'),
        CheckConstraint("estado IN ('Registrado', 'Asistido', 'Completado', 'Ganador')", name='check_estado_valido'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="usuario_eventos")
    evento = relationship(lambda: Evento, back_populates="usuario_eventos")


class Notificacion(Base):
    __tablename__ = "notificaciones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(255), nullable=False)
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50), default='sistema', nullable=False)
    leido = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("tipo IN ('evento', 'recordatorio', 'sistema', 'logro')", name='check_tipo_valido'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="notificaciones")


class DesafioDiario(Base):
    """Desafío global del día - el mismo para todos los usuarios"""
    __tablename__ = "desafios_diarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    fecha = Column(Date, nullable=False, unique=True)  # Un desafío por día, global para todos
    titulo = Column(String(255), nullable=False)
    lenguaje_recomendado = Column(String(50), nullable=False)
    contexto_negocio = Column(Text, nullable=True)
    definicion_problema = Column(Text, nullable=False)
    templates_lenguajes_json = Column(JSONB, nullable=True)
    restricciones_json = Column(JSONB, nullable=True)
    casos_prueba_json = Column(JSONB, nullable=True)
    pista = Column(Text, nullable=True)
    dificultad = Column(String(50), default='Medio', nullable=False)
    xp_recompensa = Column(Integer, default=50, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("dificultad IN ('Fácil', 'Medio', 'Difícil')", name='check_dificultad_valida'),
        CheckConstraint('xp_recompensa >= 0', name='check_xp_positivo'),
    )
    
    progresos = relationship(lambda: ProgresoDesafioDiario, back_populates="desafio", cascade="all, delete-orphan")


class ProgresoDesafioDiario(Base):
    """Progreso de cada usuario en el desafío diario"""
    __tablename__ = "progreso_desafio_diario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    desafio_id = Column(UUID(as_uuid=True), ForeignKey("desafios_diarios.id", ondelete="CASCADE"), nullable=False)
    estado = Column(String(50), default='pendiente', nullable=False)
    completado_at = Column(TIMESTAMP(timezone=True), nullable=True)
    codigo_enviado = Column(Text, nullable=True)  # Guardar el código que envió el usuario
    lenguaje_usado = Column(String(50), nullable=True)  # Lenguaje que usó
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'desafio_id', name='unique_usuario_desafio'),
        CheckConstraint("estado IN ('pendiente', 'en_progreso', 'completado', 'abandonado')", name='check_estado_progreso_valido'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="progresos_desafios")
    desafio = relationship(lambda: DesafioDiario, back_populates="progresos")


class Noticia(Base):
    __tablename__ = "noticias"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=True)
    titulo_resumen = Column(String(500), nullable=False)
    url = Column(Text, nullable=False, unique=True)
    fecha_publicacion = Column(Date, nullable=True)
    imagen_url = Column(Text, nullable=True)
    fuente = Column(String(255), nullable=True)
    relevancia = Column(String(20), default='Media', nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("relevancia IN ('Alta', 'Media', 'Baja')", name='check_relevancia_valida'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="noticias")


class ProyectoUsuario(Base):
    __tablename__ = "proyectos_usuario"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    titulo = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    tecnologias = Column(JSONB, default=[], nullable=True) # Lista de strings
    url_repositorio = Column(String(255), nullable=True)
    url_demo = Column(String(255), nullable=True)
    imagen_url = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    usuario = relationship(lambda: Usuario, back_populates="proyectos")


class RevisionCodigo(Base):
    __tablename__ = "revisiones_codigo"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    lenguaje = Column(String(50), nullable=False)
    codigo_original = Column(Text, nullable=False)
    resumen_ejecutivo = Column(Text, nullable=True)
    puntos_fuertes_json = Column(JSONB, nullable=True)
    oportunidades_mejora_json = Column(JSONB, nullable=True)
    optimizacion_json = Column(JSONB, nullable=True)
    pista_conceptual = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    usuario = relationship(lambda: Usuario, back_populates="revisiones")


class MensajeChat(Base):
    __tablename__ = "mensajes_chat"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    mensaje = Column(Text, nullable=False)
    es_usuario = Column(Boolean, nullable=False)
    timestamp = Column(Time, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    usuario = relationship(lambda: Usuario, back_populates="mensajes")


class BusquedaReciente(Base):
    __tablename__ = "busquedas_recientes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    texto_busqueda = Column(String(500), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    usuario = relationship(lambda: Usuario, back_populates="busquedas")


class Badge(Base):
    """
    Sistema de badges gamificados para reconocimiento de logros.
    Ejemplos: Racha de 7 días, 10 problemas difíciles resueltos, etc.
    """
    __tablename__ = "badges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    nombre = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=False)
    icono = Column(String(50), nullable=False)  # Nombre del ícono (Ionicons)
    color = Column(String(7), default='#3B82F6', nullable=False)  # Hex color
    rareza = Column(String(20), default='Común', nullable=False)
    criterio_json = Column(JSONB, nullable=False)  # {"tipo": "racha", "dias": 7}
    xp_bonus = Column(Integer, default=0, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    
    __table_args__ = (
        CheckConstraint("rareza IN ('Común', 'Raro', 'Épico', 'Legendario')", name='check_rareza_valida'),
        CheckConstraint('xp_bonus >= 0', name='check_xp_bonus_positivo'),
    )
    
    usuarios_badges = relationship(lambda: UsuarioBadge, back_populates="badge", cascade="all, delete-orphan")


class UsuarioBadge(Base):
    """
    Relación many-to-many entre usuarios y badges desbloqueados.
    """
    __tablename__ = "usuario_badges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    badge_id = Column(UUID(as_uuid=True), ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    desbloqueado_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    progreso_actual = Column(Integer, default=0)  # Para badges parciales (ej: 3/7 días)
    notificado = Column(Boolean, default=False)  # Si ya se envió notificación
    
    __table_args__ = (
        UniqueConstraint('usuario_id', 'badge_id', name='unique_usuario_badge'),
        CheckConstraint('progreso_actual >= 0', name='check_progreso_positivo'),
    )
    
    usuario = relationship(lambda: Usuario, back_populates="badges")
    badge = relationship(lambda: Badge, back_populates="usuarios_badges")


class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    nombre = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    perfil = relationship(lambda: PerfilUsuario, back_populates="usuario", uselist=False, cascade="all, delete-orphan")
    intereses = relationship(lambda: InteresUsuario, back_populates="usuario", cascade="all, delete-orphan")
    lenguajes = relationship(lambda: LenguajeUsuario, back_populates="usuario", cascade="all, delete-orphan")
    eventos_guardados = relationship(lambda: EventoGuardado, back_populates="usuario", cascade="all, delete-orphan")
    usuario_eventos = relationship(lambda: UsuarioEvento, back_populates="usuario", cascade="all, delete-orphan")
    notificaciones = relationship(lambda: Notificacion, back_populates="usuario", cascade="all, delete-orphan")
    progresos_desafios = relationship(lambda: ProgresoDesafioDiario, back_populates="usuario", cascade="all, delete-orphan")
    noticias = relationship(lambda: Noticia, back_populates="usuario", cascade="all, delete-orphan")
    revisiones = relationship(lambda: RevisionCodigo, back_populates="usuario", cascade="all, delete-orphan")
    mensajes = relationship(lambda: MensajeChat, back_populates="usuario", cascade="all, delete-orphan")
    busquedas = relationship(lambda: BusquedaReciente, back_populates="usuario", cascade="all, delete-orphan")
    badges = relationship(lambda: UsuarioBadge, back_populates="usuario", cascade="all, delete-orphan")
    proyectos = relationship(lambda: ProyectoUsuario, back_populates="usuario", cascade="all, delete-orphan")
