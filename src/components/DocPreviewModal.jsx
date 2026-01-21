import React, { useState, useEffect, useMemo } from 'react';
import Modal from './Modal';
import { FaDownload } from 'react-icons/fa';

/**
 * Componente para previsualizar documentos con carga segura y sin errores de CORS
 */
const DocPreviewModal = ({ isOpen, onClose, fileUrl, fileName }) => {
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

    // 1. Limpieza de URL
    const cleanUrl = useMemo(() => {
        if (!fileUrl || typeof fileUrl !== 'string') return '';
        if (fileUrl.startsWith('{') || fileUrl.startsWith('[')) {
            try {
                const parsed = JSON.parse(fileUrl);
                return parsed.url || parsed.link || parsed.id || fileUrl;
            } catch (e) { return fileUrl; }
        }
        return fileUrl;
    }, [fileUrl]);

    const ext = useMemo(() => {
        try {
            const path = cleanUrl.split('?')[0];
            const extFromUrl = path.split('.').pop().toLowerCase();
            // Evitar extensiones falsas de IDs largos (como YouTube IDs)
            if (extFromUrl.length > 5 && fileName) return fileName.split('.').pop().toLowerCase();
            return extFromUrl;
        } catch (e) { return ''; }
    }, [cleanUrl, fileName]);

    const config = useMemo(() => {
        const urlLower = cleanUrl.toLowerCase();
        const nameLower = (fileName || '').toLowerCase();

        // Detección de YouTube prioritaria
        const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = cleanUrl.match(youtubeRegExp);
        const youtubeId = (match && match[2].length === 11) ? match[2] : null;
        const isYouTube = !!youtubeId;

        // Otros tipos
        const isPDF = (ext === 'pdf' || urlLower.includes('.pdf') || nameLower.endsWith('.pdf')) && !isYouTube;
        const isWord = ['doc', 'docx'].includes(ext) || nameLower.endsWith('.doc') || nameLower.endsWith('.docx');
        const isExcel = ['xls', 'xlsx'].includes(ext) || nameLower.endsWith('.xls') || nameLower.endsWith('.xlsx');
        const isOffice = (isWord || isExcel) && !isYouTube;
        const isImage = (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext) || cleanUrl.includes('image/upload')) && !isPDF && !isOffice && !isYouTube;
        const isVideo = (['mp4', 'webm', 'ogg', 'mov'].includes(ext) || cleanUrl.includes('video/upload')) && !isYouTube;
        const isText = ['json', 'txt', 'csv', 'md', 'js', 'html', 'css', 'xml'].includes(ext) && !isYouTube && !isPDF;

        return { isImage, isPDF, isVideo, isText, isYouTube, youtubeId, isOffice };
    }, [ext, cleanUrl, fileName]);

    // 2. Carga Inteligente (Solo fetch para PDF y Texto)
    useEffect(() => {
        if (!isOpen || !cleanUrl) return;

        // CRÍTICO: No hacer fetch si es YouTube o Video (evita error de CORS)
        const shouldFetch = (config.isPDF || config.isText) && !config.isYouTube && !config.isVideo;

        if (!shouldFetch) {
            setLoading(false);
            return;
        }

        const loadContent = async () => {
            setLoading(true);
            try {
                if (config.isPDF) {
                    const response = await fetch(cleanUrl);
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
                    setPdfBlobUrl(url);
                } else if (config.isText) {
                    const response = await fetch(cleanUrl);
                    const text = await response.text();
                    setTextContent(text);
                }
            } catch (error) {
                console.error('Error cargando contenido:', error);
            } finally {
                setLoading(false);
            }
        };

        loadContent();

        return () => {
            if (pdfBlobUrl) window.URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
            setTextContent('');
        };
    }, [isOpen, cleanUrl, config.isPDF, config.isText, config.isYouTube, config.isVideo]);

    const handleDownload = (e) => {
        e.preventDefault();
        window.open(cleanUrl.includes('cloudinary.com') ? cleanUrl.replace('/upload/', '/upload/fl_attachment/') : cleanUrl, '_blank');
    };

    if (!isOpen || !fileUrl) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Vista Previa: ${fileName || 'Archivo'}`} className="modal-xl">
            <div className="doc-preview-container" style={{ display: 'flex', flexDirection: 'column', height: '82vh', minHeight: '600px' }}>
                <div className="preview-toolbar" style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 0', borderBottom: '1px solid var(--border-primary)', marginBottom: '15px', flexShrink: 0 }}>
                    {!config.isYouTube && (
                        <button onClick={handleDownload} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--text-primary)', background: 'var(--bg-card-hover)', border: '1px solid var(--border-primary)', cursor: 'pointer' }}>
                            <FaDownload /> Descargar original
                        </button>
                    )}
                </div>

                <div className="preview-frame" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#0a0a0a', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-primary)', position: 'relative' }}>
                    {loading ? (
                        <div style={{ color: '#fff' }}>Cargando vista previa...</div>
                    ) : config.isYouTube ? (
                        <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${config.youtubeId}?autoplay=1`} title="YouTube" frameBorder="0" allowFullScreen style={{ flex: 1 }}></iframe>
                    ) : config.isImage ? (
                        <img src={cleanUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : config.isVideo ? (
                        <video controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }}><source src={cleanUrl} /></video>
                    ) : config.isPDF ? (
                        <iframe src={pdfBlobUrl} title="PDF" width="100%" height="100%" style={{ border: 'none', background: '#fff' }}></iframe>
                    ) : config.isOffice ? (
                        <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(cleanUrl)}`} title="Office" width="100%" height="100%" style={{ border: 'none', background: '#fff' }}></iframe>
                    ) : config.isText ? (
                        <div style={{ width: '100%', height: '100%', background: '#1e1e1e', padding: '20px', overflow: 'auto', color: '#d4d4d4', fontFamily: 'monospace', fontSize: '14px' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{textContent}</pre>
                        </div>
                    ) : (
                        <div style={{ color: '#fff' }}>Vista previa no disponible. Usa el botón de descarga.</div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default DocPreviewModal;
