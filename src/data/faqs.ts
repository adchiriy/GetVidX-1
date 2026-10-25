import { SupportedLocale } from '../i18n/types';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const FAQS_BY_LOCALE: Record<SupportedLocale, FaqItem[]> = {
  en: [
    {
      id: 'faq-free',
      question: 'Is it completely free to download videos with GetVidX?',
      answer:
        'Yes! GetVidX is 100% free with no hidden charges, trial periods, or mandatory account creation. You can convert and save as many public Twitter (X) clips as you need.',
    },
    {
      id: 'faq-ios',
      question: 'How can I download Twitter videos on an iPhone or iPad?',
      answer:
        'Open Safari on iOS 13 or newer, visit GetVidX, paste your Tweet link, choose the desired quality, and tap Download. Safari will prompt you to save the video directly to your Files or Camera Roll.',
    },
    {
      id: 'faq-private',
      question: 'Can I download videos from private Twitter accounts?',
      answer:
        'No. Due to privacy and security protections, GetVidX only extracts media from publicly viewable tweets. We never bypass account privacy barriers or access protected content.',
    },
    {
      id: 'faq-location',
      question: 'Where are the downloaded files saved on my device?',
      answer:
        'On Windows and Mac, files are saved in your default "Downloads" folder. On Android and iOS, they go to your Downloads directory or Photos / Files app depending on your browser preferences.',
    },
    {
      id: 'faq-mp3',
      question: 'Can I extract MP3 audio from a Twitter video?',
      answer:
        'Yes! GetVidX provides a dedicated "Download Audio (MP3)" option for videos that include an audio stream, extracting a crisp 128kbps or 320kbps audio track.',
    },
    {
      id: 'faq-storage',
      question: 'Does GetVidX store copies of downloaded videos?',
      answer:
        'No. GetVidX operates on a zero-storage principle. We do not host, store, or archive any media files or personal logs. All video streams are retrieved directly from official Twitter CDN servers.',
    },
    {
      id: 'faq-error',
      question: 'Why did a download fail or show an error?',
      answer:
        'Downloads can fail if the tweet URL is misspelled, if the tweet contains only photos without video, if the original author deleted the tweet, or if the account is set to private.',
    },
    {
      id: 'faq-legal',
      question: 'Is it legal to download videos from Twitter?',
      answer:
        'Downloading publicly accessible videos for personal, offline viewing and fair use is generally permitted. However, re-distributing, claiming copyright, or monetizing other creators’ content without authorization is prohibited.',
    },
  ],

  es: [
    {
      id: 'faq-free',
      question: '¿Es completamente gratis descargar vídeos con GetVidX?',
      answer:
        '¡Sí! GetVidX es 100% gratuito, sin tarifas ocultas, sin registros obligatorios ni períodos de prueba. Puedes descargar y convertir todos los vídeos públicos de X que desees.',
    },
    {
      id: 'faq-ios',
      question: '¿Cómo descargo vídeos de Twitter en iPhone o iPad?',
      answer:
        'Abre Safari en iOS 13 o superior, entra a GetVidX, pega el enlace del Tweet, elige la resolución y pulsa en Descargar. Safari te preguntará si deseas guardar el archivo en Archivos o en tu Carrete.',
    },
    {
      id: 'faq-private',
      question: '¿Puedo descargar vídeos de cuentas privadas de Twitter?',
      answer:
        'No. Por motivos de privacidad y seguridad, GetVidX solo puede procesar tweets públicos accesibles para todo el mundo. No eludimos medidas de protección de cuentas privadas.',
    },
    {
      id: 'faq-location',
      question: '¿Dónde se guardan los archivos descargados en mi dispositivo?',
      answer:
        'En PC y Mac se guardan en la carpeta predeterminada de "Descargas". En dispositivos móviles Android y iPhone se almacenan en la app de Archivos o en la Galería multimedia.',
    },
    {
      id: 'faq-mp3',
      question: '¿Puedo extraer audio MP3 de un vídeo de Twitter?',
      answer:
        '¡Sí! GetVidX incluye una opción específica para extraer y guardar únicamente la pista de audio en formato MP3 con calidad cristalina.',
    },
    {
      id: 'faq-storage',
      question: '¿GetVidX almacena copias de los vídeos descargados?',
      answer:
        'No. GetVidX funciona con política de cero almacenamiento. No alojamos ni guardamos copias de ningún archivo. Todo el contenido se transfiere directamente desde los servidores CDN oficiales.',
    },
    {
      id: 'faq-error',
      question: '¿Por qué falló una descarga o mostró un error?',
      answer:
        'Las causas habituales son: enlace incorrecto, publicación que solo contiene imágenes sin vídeo, tweet eliminado por su autor o cuenta configurada como privada.',
    },
    {
      id: 'faq-legal',
      question: '¿Es legal descargar vídeos de Twitter?',
      answer:
        'Descargar vídeos públicos para uso personal y visualización sin conexión suele considerarse uso legítimo. No está permitido republicar o comercializar obras de terceros sin autorización.',
    },
  ],

  fr: [
    {
      id: 'faq-free',
      question: 'Est-ce totalement gratuit de télécharger des vidéos avec GetVidX ?',
      answer:
        'Oui ! GetVidX est 100% gratuit, sans frais cachés, sans période d’essai et sans création de compte obligatoire. Vous pouvez télécharger tous les clips publics souhaités.',
    },
    {
      id: 'faq-ios',
      question: 'Comment télécharger des vidéos Twitter sur un iPhone ou un iPad ?',
      answer:
        'Ouvrez Safari (iOS 13+), accédez à GetVidX, collez votre lien de Tweet, sélectionnez la qualité désirée et appuyez sur Télécharger. Safari enregistrera la vidéo directement dans vos Fichiers ou Photos.',
    },
    {
      id: 'faq-private',
      question: 'Puis-je télécharger des vidéos de comptes Twitter privés ?',
      answer:
        'Non. Par respect de la vie privée et des règles de sécurité, GetVidX ne peut extraire que les médias provenant de tweets publics.',
    },
    {
      id: 'faq-location',
      question: 'Où sont enregistrés les fichiers téléchargés ?',
      answer:
        'Sur ordinateur (Windows / Mac), les fichiers se trouvent dans votre dossier "Téléchargements". Sur mobile (Android / iOS), ils se trouvent dans l’application Fichiers ou Photos.',
    },
    {
      id: 'faq-mp3',
      question: 'Est-il possible d’extraire l’audio MP3 d’une vidéo Twitter ?',
      answer:
        'Oui ! GetVidX propose une option dédiée pour télécharger uniquement la piste audio au format MP3 en haute clarté.',
    },
    {
      id: 'faq-storage',
      question: 'GetVidX conserve-t-il des copies des vidéos téléchargées ?',
      answer:
        'Non. GetVidX applique une stricte politique de zéro stockage. Aucun média n’est hébergé sur nos serveurs ; tout est extrait directement des CDN de Twitter.',
    },
    {
      id: 'faq-error',
      question: 'Pourquoi un téléchargement échoue-t-il ?',
      answer:
        'Les erreurs surviennent généralement si le lien est incomplet, si la publication ne contient pas de vidéo (images seules), si le tweet a été supprimé ou si le compte est protégé.',
    },
    {
      id: 'faq-legal',
      question: 'Est-il légal de télécharger des vidéos depuis Twitter ?',
      answer:
        'Le téléchargement pour un usage personnel et privé hors ligne est généralement autorisé. La redistribution commerciale sans accord de l’auteur est strictement interdite.',
    },
  ],

  pt: [
    {
      id: 'faq-free',
      question: 'É totalmente gratuito baixar vídeos com o GetVidX?',
      answer:
        'Sim! O GetVidX é 100% gratuito, sem taxas ocultas, sem assinaturas e sem necessidade de criar conta. Você pode baixar quantos vídeos públicos precisar.',
    },
    {
      id: 'faq-ios',
      question: 'Como baixar vídeos do Twitter no iPhone ou iPad?',
      answer:
        'Abra o navegador Safari no iOS 13 ou superior, acesse o GetVidX, cole o link do Tweet, selecione a resolução e toque em Baixar. O Safari salvará o vídeo diretamente no app Arquivos ou Fotos.',
    },
    {
      id: 'faq-private',
      question: 'Posso baixar vídeos de contas privadas do Twitter?',
      answer:
        'Não. Por motivos de privacidade e conformidade técnica, o GetVidX só consegue processar publicações públicas. Não violamos contas protegidas.',
    },
    {
      id: 'faq-location',
      question: 'Onde os arquivos baixados são salvos no meu dispositivo?',
      answer:
        'No Windows e Mac, os arquivos vão para a pasta padrão "Downloads". Em celulares Android e iOS, ficam salvos nos Arquivos ou na Galeria de Fotos.',
    },
    {
      id: 'faq-mp3',
      question: 'Consigo extrair áudio MP3 de um vídeo do Twitter?',
      answer:
        'Sim! O GetVidX possui um botão dedicado para baixar apenas a trilha sonora em MP3 com som limpo.',
    },
    {
      id: 'faq-storage',
      question: 'O GetVidX armazena cópias dos vídeos baixados?',
      answer:
        'Não. O GetVidX adota o princípio de armazenamento zero. Não salvamos nenhuma mídia em nossos servidores; todos os arquivos vêm diretamente da CDN oficial.',
    },
    {
      id: 'faq-error',
      question: 'Por que o download falhou ou exibiu um erro?',
      answer:
        'Normalmente ocorre se o link contiver erros de digitação, se o tweet contiver apenas fotos ou texto, se foi apagado pelo autor ou se a conta for restrita.',
    },
    {
      id: 'faq-legal',
      question: 'É legal baixar vídeos do Twitter?',
      answer:
        'O download para consumo pessoal e visualização offline é geralmente permitido pelo uso justo. No entanto, republique ou comercialize conteúdos alheios apenas com autorização do autor.',
    },
  ],

  ar: [
    {
      id: 'faq-free',
      question: 'هل تحميل مقاطع الفيديو مجاني تماماً عبر GetVidX؟',
      answer:
        'نعم! موقع GetVidX مجاني 100% بدون أي رسوم خفية أو فترات تجريبية أو اشتراكات، ولا يتطلب إنشاء حساب أو تسجيل دخول. يمكنك تنزيل ما تشاء من مقاطع تويتر العامة بكل حرية.',
    },
    {
      id: 'faq-ios',
      question: 'كيف يمكنني تنزيل مقاطع فيديو تويتر على أجهزة آيفون وآيباد؟',
      answer:
        'افتح متصفح Safari على نظام iOS 13 أو الأحدث، وتوجه لموقع GetVidX، ثم الصق رابط التغريدة واختر الجودة المطلوبة وانقر على "تحميل". سيطلب منك Safari حفظ الفيديو في تطبيق الملفات أو المعرض.',
    },
    {
      id: 'faq-private',
      question: 'هل يمكن تحميل مقاطع من حسابات تويتر الخاصة أو المغلقة؟',
      answer:
        'لا، لحماية خصوصية المستخدمين وسياسات الحماية، يستخرج GetVidX مقاطع الفيديو من التغريدات العامة فقط المتاحة لجميع المشاهدين. لا يمكننا الوصول لأي حساب مقفل.',
    },
    {
      id: 'faq-location',
      question: 'أين يتم حفظ الملفات ومقاطع الفيديو بعد تحميلها؟',
      answer:
        'على أجهزة الكمبيوتر (ويندوز وماك)، تُحفظ الملفات في مجلد "التنزيلات" (Downloads). أما على هواتف أندرويد وآيفون، فتجدها في تطبيق التنزيلات أو تطبيق الصور والملفات.',
    },
    {
      id: 'faq-mp3',
      question: 'هل يدعم الموقع استخراج الصوت بصيغة MP3 من فيديو تويتر؟',
      answer:
        'نعم بكل تأكيد! يوفر GetVidX خياراً مخصصاً يتيح لك استخراج المسار الصوتي فقط بصيغة MP3 بنقاء ممتاز، مما يجعله مثالياً لحفظ المقاطع الصوتية والموسيقى والبودكاست.',
    },
    {
      id: 'faq-storage',
      question: 'هل يحتفظ موقع GetVidX بنسخ من مقاطع الفيديو التي أقوم بتحميلها؟',
      answer:
        'قطعاً لا. يلتزم GetVidX بمبدأ انعدام التخزين (Zero Storage). نحن لا نخزن أو نحتفظ بأي ملفات وسائط على خوادمنا نهائياً، بل يتم نقلها مباشرة من خوادم تويتر الرسمية إلى جهازك.',
    },
    {
      id: 'faq-error',
      question: 'لماذا فشل التحميل أو ظهرت رسالة خطأ عند فحص الرابط؟',
      answer:
        'تحدث الأخطاء عادة عند: كتابة رابط غير مكتمل، أو إذا كانت التغريدة تحتوي على صور ثابتة فقط بدون فيديو، أو إذا قام صاحب التغريدة بحذفها، أو إذا كان الحساب خاصاً.',
    },
    {
      id: 'faq-legal',
      question: 'هل تحميل مقاطع الفيديو من منصة تويتر أمر قانوني ومصرح به؟',
      answer:
        'تحميل المقاطع العامة للاستخدام الشخصي والمشاهدة دون اتصال بالإنترنت يعتبر ضمن الاستخدام العادل المقبول. ولكن لا يُسمح بإعادة نشر المحتوى تجارياً أو نسبه لنفسك دون إذن من صاحب العمل الأصلي.',
    },
  ],
};
