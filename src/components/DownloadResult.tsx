import React, { useState, useRef, useEffect } from 'react';
import Hls from 'hls.js';
import {
  Download,
  Copy,
  Check,
  Music,
  Video,
  RefreshCw,
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Radio,
  Play,
  Terminal,
  Image as ImageIcon,
  MessageSquareQuote,
} from 'lucide-react';
import { TweetAnalysisResult, MediaFormat } from '../utils/downloader';
import { SupportedLocale } from '../i18n/types';
import { TRANSLATIONS } from '../i18n/translations';

interface DownloadResultProps {
  currentLocale: SupportedLocale;
  result: TweetAnalysisResult;
  onReset: () => void;
  activeFilter: 'all' | 'audio' | 'gif' | 'live';
}

const DOWNLOADING_TEXT: Record<SupportedLocale, string> = {
  en: 'Downloading...',
  es: 'Descargando...',
  fr: 'Téléchargement...',
  pt: 'Baixando...',
  ar: 'جاري التنزيل...',
};

export const DownloadResult: React.FC<DownloadResultProps> = ({
  currentLocale,
  result,
  onReset,
  activeFilter,
}) => {
  const t = TRANSLATIONS[currentLocale];
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Filter formats based on selected tab; if empty or for photos, gracefully fall back
  const candidateFormats = result.formats.filter((f) => {
    if (result.isPhoto) return true;
    if (activeFilter === 'audio') return f.isAudioOnly;
    if (activeFilter === 'gif') return result.isGif || f.format === 'GIF';
    if (activeFilter === 'live') return f.isLiveStream || f.format === 'M3U8';
    return true;
  });

  const displayedFormats = candidateFormats.length > 0 ? candidateFormats : result.formats;
  const isFallbackFilter = candidateFormats.length === 0 && result.formats.length > 0;
  const hasLiveStream = Boolean(result.isLive || result.isSpace || result.isBroadcast);
  const m3u8Format = result.formats.find((f) => f.format === 'M3U8' || f.isLiveStream);
  const bestMp4 = result.formats.find((f) => f.format === 'MP4');
  const playableVideoUrl = !result.isPhoto
    ? (bestMp4?.proxyUrl || result.previewUrl || bestMp4?.directUrl || m3u8Format?.directUrl)
    : undefined;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playableVideoUrl) return;

    const isHls = playableVideoUrl.includes('.m3u8');
    let hlsInstance: Hls | null = null;

    if (isHls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsInstance.loadSource(playableVideoUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsInstance?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsInstance?.recoverMediaError();
              break;
            default:
              hlsInstance?.destroy();
              break;
          }
        }
      });
    } else {
      video.src = playableVideoUrl;
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [playableVideoUrl]);

  const handleCopyLink = async (format: MediaFormat) => {
    try {
      await navigator.clipboard.writeText(format.directUrl);
      setCopiedFormatId(format.id);
      setTimeout(() => setCopiedFormatId(null), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleCopyFfmpeg = async (streamUrl: string, filename: string) => {
    try {
      const cmd = `ffmpeg -i "${streamUrl}" -c copy "${filename.replace('.m3u8', '.mp4')}"`;
      await navigator.clipboard.writeText(cmd);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2500);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  /**
   * Resilient media download trigger.
   * 1. Attempts proxy-download stream first (server-side).
   * 2. If proxy returns 404/5xx (e.g. on static Vercel deployments), fetches directUrl via CORS (Twitter CDN allows access-control-allow-origin: *).
   * 3. Generates a typed binary Blob to guarantee file integrity and immediate playback.
   * 4. If fetch fails completely, triggers browser download directly on directUrl (never broken proxyUrl).
   */
  const handleDownload = async (e: React.MouseEvent, fmt: MediaFormat) => {
    e.preventDefault();
    if (downloadingId) return;

    setDownloadingId(fmt.id);
    setDownloadError(null);

    const triggerBlobSave = (blob: Blob, contentType: string) => {
      const typedBlob = new Blob([blob], { type: contentType });
      const blobUrl = window.URL.createObjectURL(typedBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fmt.filename;
      downloadLink.style.display = 'none';
      document.body.appendChild(downloadLink);
      downloadLink.click();

      setTimeout(() => {
        if (document.body.contains(downloadLink)) {
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobUrl);
      }, 60000);
    };

    const triggerDirectFallback = () => {
      const fallbackUrl = fmt.directUrl || fmt.proxyUrl;
      const fallback = document.createElement('a');
      fallback.href = fallbackUrl;
      fallback.download = fmt.filename;
      fallback.target = '_blank';
      fallback.rel = 'noopener noreferrer';
      fallback.style.display = 'none';
      document.body.appendChild(fallback);
      fallback.click();
      setTimeout(() => {
        if (document.body.contains(fallback)) {
          document.body.removeChild(fallback);
        }
      }, 5000);
    };

    try {
      let response: Response | null = null;

      // 1. Attempt backend proxy download route first
      if (fmt.proxyUrl) {
        try {
          const res = await fetch(fmt.proxyUrl);
          if (res.ok) {
            response = res;
          }
        } catch (_) {
          // Proxy endpoint unavailable or network error
        }
      }

      // 2. If proxy is unavailable or returned 404/5xx (e.g. Vercel frontend without backend),
      // fetch directly from Twitter CDN (video.twimg.com has access-control-allow-origin: *)
      if (!response && fmt.directUrl) {
        try {
          const directRes = await fetch(fmt.directUrl, { mode: 'cors' });
          if (directRes.ok) {
            response = directRes;
          }
        } catch (corsErr) {
          console.warn('Direct CDN fetch failed or CORS prevented:', corsErr);
        }
      }

      if (response && response.ok) {
        const contentType = response.headers.get('content-type') || (
          fmt.format === 'MP3'
            ? 'audio/mpeg'
            : fmt.format === 'M4A'
            ? 'audio/mp4'
            : fmt.format === 'JPG'
            ? 'image/jpeg'
            : 'video/mp4'
        );

        const blob = await response.blob();
        if (blob.size > 0) {
          triggerBlobSave(blob, contentType);
          return;
        }
      }

      // 3. If binary streaming was not possible, trigger fallback on real media URL
      triggerDirectFallback();
    } catch (err: any) {
      console.warn('Download handler error, triggering direct fallback:', err);
      try {
        triggerDirectFallback();
      } catch (_) {
        setDownloadError(err?.message || 'Error occurred while saving file.');
      }
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div
      id="download-results"
      className="max-w-4xl mx-auto my-8 px-4"
    >
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {result.authorAvatar ? (
              <img
                src={result.authorAvatar}
                alt={result.authorName}
                className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                {result.isPhoto ? '🖼️' : result.isSpace ? '🎙️' : result.isLive ? '🔴' : result.authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-slate-900 text-sm sm:text-base leading-tight flex flex-wrap items-center gap-2">
                <span>{result.authorName}</span>
                {result.isQuoted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <MessageSquareQuote className="w-3 h-3 text-amber-600" />
                    <span>Quoted @{result.quotedAuthor}</span>
                  </span>
                )}
                {hasLiveStream && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700 border border-red-200 animate-pulse">
                    <Radio className="w-3 h-3 text-red-600" />
                    <span>LIVE / SPACE</span>
                  </span>
                )}
                {result.isPhoto && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ImageIcon className="w-3 h-3 text-emerald-600" />
                    <span>HD PHOTOS</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 font-mono" dir="ltr">
                @{result.username}
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t.downloadAnother}</span>
          </button>
        </div>

        {/* Live Broadcast / Space Banner if detected */}
        {hasLiveStream && (
          <div className="bg-gradient-to-r from-red-500/10 via-amber-500/10 to-blue-500/10 border-b border-red-100 p-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-red-900">
                  {result.isSpace ? 'Twitter (X) Space Recording Detected' : 'Twitter (X) Live Broadcast Stream'}
                </h3>
                <p className="text-xs text-red-700/90">
                  {result.isSpace
                    ? 'Download the full Space audio recording (MP3/M4A) or copy the master HLS stream link.'
                    : 'Download available MP4 video replay qualities or stream live broadcast via HLS (.m3u8).'}
                </p>
              </div>
            </div>

            {m3u8Format && (
              <button
                type="button"
                onClick={() => handleCopyFfmpeg(m3u8Format.directUrl, m3u8Format.filename)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                title="Copy FFmpeg command to save recording directly"
              >
                <Terminal className="w-3.5 h-3.5 text-red-600" />
                <span>{copiedCmd ? t.commandCopied : t.copyCommand}</span>
              </button>
            )}
          </div>
        )}

        {/* Quoted Tweet Notice */}
        {result.isQuoted && (
          <div className="bg-amber-50/80 border-b border-amber-200/80 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Quote Tweet Detected:</strong> Extracted media stream from the quoted post by <strong>@{result.quotedAuthor}</strong>.
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Media Player / In-Browser Playback Preview */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="relative w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-video flex items-center justify-center shadow-inner">
              {playableVideoUrl ? (
                <video
                  ref={videoRef}
                  src={playableVideoUrl.includes('.m3u8') ? undefined : playableVideoUrl}
                  poster={result.thumbnailUrl}
                  controls
                  playsInline
                  preload="metadata"
                  {...({ referrerPolicy: 'no-referrer' } as any)}
                  className="w-full h-full object-contain"
                />
              ) : result.isSpace && m3u8Format ? (
                <div className="flex flex-col items-center justify-center p-4 text-center text-white gap-2">
                  <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center animate-pulse">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div className="font-bold text-sm">Twitter Space Live Audio</div>
                  <div className="text-xs text-slate-400">AAC High-Definition Audio Recording</div>
                </div>
              ) : result.thumbnailUrl ? (
                <img
                  src={result.thumbnailUrl}
                  alt={result.tweetText || 'Tweet media preview'}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Video className="w-8 h-8 opacity-40" />
                  <span>Media Preview</span>
                </div>
              )}

              {result.duration && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-white text-[11px] font-mono tabular-nums">
                  {result.duration}
                </div>
              )}
            </div>

            {/* In-Browser Preview Helper */}
            <div className="mt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
              {result.isPhoto ? (
                <span>High-resolution original media attachment</span>
              ) : (
                <>
                  <Play className="w-3 h-3 text-blue-600" />
                  <span>Tap play above to preview video and test audio directly!</span>
                </>
              )}
            </div>

            {/* Tweet Text Excerpt */}
            {result.tweetText && (
              <p className="mt-3 text-xs sm:text-sm text-slate-600 italic line-clamp-3 w-full text-left rtl:text-right">
                "{result.tweetText}"
              </p>
            )}
          </div>

          {/* Download Options List */}
          <div className="md:col-span-7 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                {t.resolutionsTitle}
              </h2>
              <span className="text-xs text-slate-400">
                {displayedFormats.length} {t.formatLabel}s
              </span>
            </div>

            {hasLiveStream && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 text-red-950 text-xs flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-red-600 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <span className="font-bold block text-sm text-red-900">{t.liveBannerTitle}</span>
                  <p className="mt-0.5 text-red-800 leading-relaxed">
                    {t.liveBannerDesc}
                  </p>
                </div>
              </div>
            )}

            {isFallbackFilter && (
              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-800 text-xs flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Showing all available media streams for this post.</span>
              </div>
            )}

            {/* Error Notification Alert */}
            {downloadError && (
              <div
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start justify-between gap-2"
                role="alert"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{downloadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDownloadError(null)}
                  className="text-red-500 hover:text-red-800 p-0.5 cursor-pointer"
                  aria-label="Close error message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div className="divide-y divide-slate-100">
              {displayedFormats.map((fmt) => {
                const isCopied = copiedFormatId === fmt.id;
                const isDownloadingThis = downloadingId === fmt.id;
                const isM3U8 = fmt.format === 'M3U8';
                const isPhoto = fmt.format === 'JPG' || fmt.isPhoto;

                const buttonLabel = isPhoto
                  ? (t.downloadImage || 'Download Image (JPG)')
                  : isM3U8
                  ? (t.downloadPlaylist || 'Download Playlist (.m3u8)')
                  : (fmt.isLiveStream && fmt.format === 'MP4')
                  ? (t.downloadLiveVideo || 'Download Live Video (MP4)')
                  : (fmt.isLiveStream && fmt.format === 'MP3')
                  ? (t.downloadSpaceAudio || 'Download Space Audio (MP3)')
                  : fmt.isAudioOnly
                  ? (fmt.filename.endsWith('.m4a') ? (currentLocale === 'es' ? 'Descargar Audio M4A' : currentLocale === 'fr' ? 'Télécharger Audio M4A' : currentLocale === 'pt' ? 'Baixar Áudio M4A' : currentLocale === 'ar' ? 'تنزيل صوت M4A' : 'Download M4A Audio') : t.extractAudio)
                  : t.actionDownload;

                const buttonColor = isPhoto
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : isM3U8
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : (fmt.isLiveStream && fmt.format === 'MP4')
                  ? 'bg-red-600 hover:bg-red-700'
                  : fmt.isAudioOnly || (fmt.isLiveStream && fmt.format === 'MP3')
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-blue-600 hover:bg-blue-700';

                return (
                  <div
                    key={fmt.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-3 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isPhoto
                            ? 'bg-emerald-50 text-emerald-600'
                            : isM3U8
                            ? 'bg-red-50 text-red-600'
                            : fmt.isAudioOnly
                            ? 'bg-indigo-50 text-indigo-600'
                            : fmt.quality === '1080p'
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {isPhoto ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : isM3U8 ? (
                          <Radio className="w-4 h-4" />
                        ) : fmt.isAudioOnly ? (
                          <Music className="w-4 h-4" />
                        ) : fmt.format === 'GIF' ? (
                          <Sparkles className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{fmt.quality}</span>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{fmt.label}</span>
                          {fmt.quality === '1080p' && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              Original HD
                            </span>
                          )}
                          {isM3U8 && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-semibold">
                              HLS Stream
                            </span>
                          )}
                          {isPhoto && (
                            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              HD Photo
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{fmt.format}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono">{fmt.resolution}</span>
                          {fmt.sizeEstimate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono text-slate-400">{fmt.sizeEstimate}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {/* Copy Direct URL */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(fmt)}
                        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors cursor-pointer"
                        title={t.actionCopyLink}
                        aria-label={t.actionCopyLink}
                      >
                        {isCopied ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Optional FFmpeg CLI Copy for live streams */}
                      {(isM3U8 || fmt.isLiveStream) && (
                        <button
                          type="button"
                          onClick={() => handleCopyFfmpeg(fmt.directUrl, fmt.filename)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                          title={copiedCmd ? t.commandCopied : t.copyCommand}
                          aria-label={t.copyCommand}
                        >
                          <Terminal className="w-4 h-4" />
                        </button>
                      )}

                      {/* Direct Browser Download Link for all media */}
                      <a
                        href={fmt.proxyUrl}
                        download={fmt.filename}
                        onClick={(e) => handleDownload(e, fmt)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white shadow-xs transition-all cursor-pointer active:scale-98 ${
                          isDownloadingThis ? 'bg-slate-700' : buttonColor
                        }`}
                      >
                        {isDownloadingThis ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>{DOWNLOADING_TEXT[currentLocale] || DOWNLOADING_TEXT.en}</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>{buttonLabel}</span>
                          </>
                        )}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Helpful saving note */}
            <div className="mt-3 p-3 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-900 text-xs">
              <span className="font-semibold">{t.directBrowserDownload}: </span>
              <span>{t.saveInstructions} {t.directDownloadNote}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
