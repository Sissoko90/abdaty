'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Search,
  Filter,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import * as content from '@/services/content.service';
import { mediaUrl } from '@/services/content.service';
import type { Media } from '@/types/content';
import { ApiRequestError } from '@/lib/api';

/** Modèle local d'affichage d'un média. */
interface MediaFile {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  altText: string;
  size: number;
  mimeType: string;
  createdAt: string;
  /** Contexte d'upload (blog, services, newsletter, general…) — déduit du domaine. */
  domain: string;
}

/** Déduit le domaine/contexte depuis l'URL (/uploads/<domain>/<fichier>). */
function domainFromUrl(url: string): string {
  const parts = (url || '').split('/').filter(Boolean); // ["uploads","blog","x.png"]
  return parts.length >= 2 ? parts[1] : 'general';
}

/** Convertit un média backend vers le modèle local d'affichage. */
function toLocal(m: Media): MediaFile {
  return {
    id: m.id,
    filename: m.filename,
    originalFilename: m.originalFilename,
    url: m.url,
    altText: m.originalFilename,
    size: m.fileSize ?? 0,
    mimeType: m.fileType ?? '',
    createdAt: m.createdAt ?? '',
    domain: m.domain || domainFromUrl(m.url),
  };
}

/** Taille de page pour l'affichage des médias. */
const MEDIA_PAGE_SIZE = 12;

export default function AdminMediaPage() {
  const t = useTranslations('admin.content.media');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const { data: session } = useSession();
  const token = session?.accessToken;
  const userId = session?.user?.id;

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  /** Recharge la liste des médias depuis le backend. */
  const reload = useCallback(() => {
    if (!token) return;
    setError('');
    content
      .listMedia(token)
      .then((list) => setMediaFiles(list.map(toLocal)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement des médias.'));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredFiles = mediaFiles.filter(
    (file) =>
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.altText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination de l'affichage.
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / MEDIA_PAGE_SIZE));
  const pagedFiles = filteredFiles.slice(page * MEDIA_PAGE_SIZE, page * MEDIA_PAGE_SIZE + MEDIA_PAGE_SIZE);
  // Revenir page 0 si la recherche réduit la liste sous la page courante.
  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(0);
  }, [page, totalPages]);

  /** Copie l'URL absolue d'un média dans le presse-papiers. */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(mediaUrl(file.url));
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    setUploading(true);
    setError('');
    try {
      // Domaine "general" pour le gestionnaire de médias générique.
      await content.uploadMedia(selectedFile, 'general', token, userId);
      setSelectedFile(null);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm(t('confirmDelete'))) return;
    setError('');
    try {
      await content.deleteMedia(id, token);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* Bandeau d'erreur */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour gérer les médias.
          </p>
        )}

        {/* Upload Section */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 mb-6">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
              {t('uploadFile')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary-100 dark:bg-primary-900 rounded-full">
                  <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-gray-900 dark:text-white transition-colors duration-300 font-medium">
                    {t('dragDrop')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {t('or')}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    accept="image/*"
                    className="max-w-xs"
                  />
                  {selectedFile && (
                    <Button onClick={handleUpload} className="gap-2" disabled={uploading || !token}>
                      <Upload className="w-4 h-4" />
                      {uploading ? '…' : t('upload')}
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {t('selectedFile')}: {selectedFile.name}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {t('filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pagedFiles.map((file) => (
            <Card key={file.id} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 overflow-hidden">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {file.mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(file.url)}
                    alt={file.altText}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <CardContent className="p-4">
                <div className="mb-2">
                  <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300 text-sm truncate" title={file.originalFilename}>
                    {file.originalFilename}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {/* Contexte + visibilité */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    {file.domain}
                  </span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    title="Servi publiquement sous /uploads (accessible via son lien)"
                  >
                    Public
                  </span>
                </div>

                {/* Lien copiable */}
                <div className="flex items-center gap-1 mb-2">
                  <input
                    readOnly
                    value={mediaUrl(file.url)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="flex-1 min-w-0 text-[11px] font-mono px-2 py-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300"
                  />
                  <Button variant="outline" size="sm" className="shrink-0 px-2" onClick={() => copyUrl(file)}>
                    {copiedId === file.id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={mediaUrl(file.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Download className="w-3 h-3" />
                      {t('download')}
                    </Button>
                  </a>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(file.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredFiles.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1} / {totalPages} — {filteredFiles.length} fichier{filteredFiles.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        )}

        {filteredFiles.length === 0 && (
          <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {t('noFiles')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
