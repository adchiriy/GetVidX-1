import { SupportedLocale } from '../i18n/types';

export interface LegalPageContent {
  slug: string;
  title: Record<SupportedLocale, string>;
  h1: Record<SupportedLocale, string>;
  lastUpdated: string;
  sections: {
    heading: Record<SupportedLocale, string>;
    paragraphs: Record<SupportedLocale, string[]>;
  }[];
}

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  terms: {
    slug: 'terms',
    title: {
      en: 'Terms of Service - GetVidX',
      es: 'Términos de Servicio - GetVidX',
      fr: 'Conditions d’Utilisation - GetVidX',
      pt: 'Termos de Serviço - GetVidX',
      ar: 'شروط الخدمة والاستخدام - GetVidX',
    },
    h1: {
      en: 'Terms of Service',
      es: 'Términos de Servicio',
      fr: 'Conditions d’Utilisation',
      pt: 'Termos de Serviço',
      ar: 'شروط الخدمة وسياسة الاستخدام',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Acceptance of Terms',
          es: '1. Aceptación de los Términos',
          fr: '1. Acceptation des Conditions',
          pt: '1. Aceitação dos Termos',
          ar: '1. قبول شروط الخدمة',
        },
        paragraphs: {
          en: [
            'By accessing and using GetVidX (the "Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our website.',
            'GetVidX is an independent utility designed to allow users to parse and download publicly available media streams from Twitter / X for personal and fair-use archiving.',
          ],
          es: [
            'Al acceder y utilizar GetVidX (el "Servicio"), aceptas cumplir con estos Términos de Servicio. Si no estás de acuerdo con alguna parte, por favor no uses nuestro sitio.',
            'GetVidX es una utilidad independiente diseñada para facilitar la descarga de medios públicos de Twitter / X con fines de archivo personal y uso legítimo.',
          ],
          fr: [
            'En accédant et en utilisant GetVidX (le "Service"), vous acceptez de vous conformer aux présentes conditions. Si vous n’acceptez pas ces conditions, veuillez ne pas utiliser le site.',
            'GetVidX est un outil indépendant permettant de télécharger des flux multimédias publics depuis Twitter / X pour un usage personnel équitable.',
          ],
          pt: [
            'Ao acessar e utilizar o GetVidX (o "Serviço"), você concorda em cumprir estes Termos de Serviço. Caso não concorde, interrompa o uso do site.',
            'O GetVidX é um utilitário independente desenvolvido para salvar mídias públicas do Twitter / X para uso pessoal e arquivamento justo.',
          ],
          ar: [
            'بدخولك واستخدامك لموقع GetVidX (المشار إليه بـ "الخدمة")، فإنك تقر وتوافق على الالتزام الكامل بشروط الخدمة هذه. إذا كنت غير موافق على أي بند، يرجى التوقف عن استخدام الموقع فوراً.',
            'موقع GetVidX هو أداة تقنية مستقلة تتيح للمستخدمين استخراج وتحميل وسائط الفيديو العامة المتاحة على منصة تويتر / X للاستخدام الشخصي العادل والأرشفة الذاتية.',
          ],
        },
      },
      {
        heading: {
          en: '2. Permitted Use and Copyrights',
          es: '2. Uso Permitido y Derechos de Autor',
          fr: '2. Utilisation Autorisée et Droits d’Auteur',
          pt: '2. Uso Permitido e Direitos Autorais',
          ar: '2. الاستخدام المسموح به وحقوق الملكية',
        },
        paragraphs: {
          en: [
            'You agree to use GetVidX solely for non-commercial, personal purposes and in accordance with applicable copyright laws. You must respect the intellectual property rights of content owners.',
            'GetVidX does not grant any copyright license to the downloaded videos. You are solely responsible for ensuring you have legitimate rights or fair use justification to save any content.',
          ],
          es: [
            'Aceptas utilizar GetVidX únicamente con fines personales no comerciales y conforme a las leyes de propiedad intelectual vigentes.',
            'GetVidX no otorga ninguna licencia sobre los vídeos descargados. El usuario es responsable exclusivo de respetar los derechos de autor.',
          ],
          fr: [
            'Vous acceptez d’utiliser GetVidX uniquement à des fins personnelles et non commerciales, dans le respect des lois sur le droit d’auteur.',
            'GetVidX ne confère aucune licence de droit d’auteur. Vous êtes seul responsable du respect des droits des créateurs originaux.',
          ],
          pt: [
            'Você concorda em usar o GetVidX exclusivamente para fins pessoais e não comerciais, respeitando a legislação de direitos autorais.',
            'O GetVidX não concede nenhuma licença sobre os conteúdos baixados. O usuário é o único responsável pelo uso adequado da mídia.',
          ],
          ar: [
            'توافق بموجب هذه الشروط على استخدام GetVidX للأغراض الشخصية غير التجارية فقط، وبما يتوافق مع القوانين والأنظمة المعمول بها لحماية حقوق النشر والتأليف.',
            'لا يمنح GetVidX أي حقوق ملكية فكرية أو تراخيص للمقاطع التي يتم تنزيلها. تقع على عاتق المستخدم وحده مسؤولية التأكد من مشروعية حفظ واستخدام أي محتوى.',
          ],
        },
      },
      {
        heading: {
          en: '3. Disclaimer of Warranties and Limitation of Liability',
          es: '3. Exclusión de Garantías y Limitación de Responsabilidad',
          fr: '3. Exclusion de Garanties et Limitation de Responsabilité',
          pt: '3. Isenção de Garantias e Limitação de Responsabilidade',
          ar: '3. إخلاء المسؤولية وحدود الضمانات',
        },
        paragraphs: {
          en: [
            'The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted availability, error-free operation, or that Twitter / X links will always be resolvable.',
            'GetVidX is not affiliated with, endorsed by, or sponsored by Twitter, Inc., X Corp, or any of their affiliates.',
          ],
          es: [
            'El Servicio se proporciona "tal cual" y según disponibilidad. No garantizamos un funcionamiento ininterrumpido ni la disponibilidad permanente de los enlaces.',
            'GetVidX no está afiliado, respaldado ni patrocinado por Twitter, Inc. ni por X Corp.',
          ],
          fr: [
            'Le Service est fourni "en l’état" sans garantie d’aucune sorte. Nous ne garantissons pas la disponibilité continue des flux Twitter.',
            'GetVidX n’est en aucun cas affilié ou approuvé par Twitter, Inc. ou X Corp.',
          ],
          pt: [
            'O Serviço é fornecido "no estado em que se encontra", sem garantias de qualquer natureza. Não garantimos disponibilidade contínua.',
            'O GetVidX não possui vínculo oficial, afiliação ou endosso do Twitter, Inc. ou X Corp.',
          ],
          ar: [
            'تُقدم الخدمة "كما هي" وبحسب التوفر دون أي ضمانات صريحة أو ضمنية. نحن لا نضمن عمل الخدمة بشكل متواصل دون انقطاع نظراً للتغيرات التقنية المستمرة في خوادم تويتر.',
            'موقع GetVidX ليس تابعاً أو مدعوماً أو معتمداً من شركة Twitter, Inc أو X Corp أو أي من الشركات التابعة لهما.',
          ],
        },
      },
    ],
  },

  privacy: {
    slug: 'privacy',
    title: {
      en: 'Privacy Policy - GetVidX',
      es: 'Política de Privacidad - GetVidX',
      fr: 'Politique de Confidentialité - GetVidX',
      pt: 'Política de Privacidade - GetVidX',
      ar: 'سياسة الخصوصية وحماية البيانات - GetVidX',
    },
    h1: {
      en: 'Privacy Policy',
      es: 'Política de Privacidad',
      fr: 'Politique de Confidentialité',
      pt: 'Política de Privacidade',
      ar: 'سياسة الخصوصية وحماية البيانات',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Zero File Storage Principle',
          es: '1. Principio de Cero Almacenamiento',
          fr: '1. Principe de Zéro Stockage',
          pt: '1. Princípio de Armazenamento Zero',
          ar: '1. مبدأ انعدام التخزين (Zero Storage)',
        },
        paragraphs: {
          en: [
            'At GetVidX, user privacy is paramount. We do not store, archive, or retain any videos, audio tracks, or images processed through our service. All media is retrieved on-the-fly directly from Twitter official Content Delivery Network (CDN) servers.',
            'Once you download your file or close the browser window, the temporary processing reference is immediately discarded.',
          ],
          es: [
            'En GetVidX, la privacidad es prioritaria. No almacenamos, guardamos ni retenemos ningún archivo de vídeo o audio procesado. Toda la información procede de la CDN oficial de Twitter.',
            'Una vez completada la descarga o cerrada la ventana del navegador, los datos temporales se descartan inmediatamente.',
          ],
          fr: [
            'La confidentialité de nos utilisateurs est absolue. Nous ne conservons ni n’hébergeons aucune vidéo ou extrait audio. Tout transite directement par le CDN officiel de Twitter.',
            'Une fois le téléchargement terminé ou la page fermée, aucune trace de fichier n’est conservée.',
          ],
          pt: [
            'No GetVidX, a privacidade é fundamental. Não armazenamos, hospedamos ou salvamos qualquer vídeo ou áudio processado no serviço.',
            'Assim que o download é concluído ou a página fechada, qualquer referência temporária é eliminada.',
          ],
          ar: [
            'نضع خصوصية المستخدمين في صدارة أولوياتنا. نحن لا نقوم بتخزين أو استضافة أو أرشفة أي مقاطع فيديو أو ملفات صوتية تمر عبر موقعنا نهائياً. يتم سحب الوسائط مباشرة من شبكات التوزيع الرسمية لخوادم تويتر.',
            'بمجرد اكتمال التنزيل أو إغلاقك لصفحة المتصفح، يتم التخلص فوراً من أي بيانات مؤقتة.',
          ],
        },
      },
      {
        heading: {
          en: '2. Information We Do NOT Collect',
          es: '2. Información que NO Recopilamos',
          fr: '2. Informations que nous NE collectons PAS',
          pt: '2. Informações que NÃO Coletamos',
          ar: '2. البيانات التي لا نجمعها مطلقاً',
        },
        paragraphs: {
          en: [
            'We do NOT require user account registration, email addresses, names, or passwords.',
            'We do NOT log your Twitter account credentials or private search history.',
            'We do NOT sell or share your personal data with third-party data brokers.',
          ],
          es: [
            'NO solicitamos registro de cuenta, correo electrónico, nombres ni contraseñas.',
            'NO registramos credenciales de tu cuenta de Twitter ni tu historial de búsqueda.',
            'NO comercializamos ni compartimos datos con intermediarios comerciales.',
          ],
          fr: [
            'Nous n’exigeons AUCUN compte utilisateur, ni adresse e-mail, ni mot de passe.',
            'Nous n’enregistrons PAS vos identifiants Twitter ni votre historique de recherche.',
            'Nous ne vendons AUCUNE donnée personnelle à des tiers.',
          ],
          pt: [
            'NÃO solicitamos cadastro, e-mail, nome ou senhas de usuários.',
            'NÃO registramos suas credenciais do Twitter nem seu histórico de buscas.',
            'NÃO vendemos nem compartilhamos informações com corretores de dados.',
          ],
          ar: [
            'لا نطلب نهائياً إنشاء حساب أو تسجيل دخول أو إدخال بريدك الإلكتروني أو بياناتك الشخصية.',
            'لا نقوم بتسجيل أو تتبع بيانات حسابك في تويتر أو سجل بحثك الخاص.',
            'لا نبيع أو نشارك أي بيانات للمستخدمين مع أطراف ثالثة أو شركات إعلانية متطفلة.',
          ],
        },
      },
      {
        heading: {
          en: '3. Cookies and Analytics',
          es: '3. Cookies y Métricas',
          fr: '3. Cookies et Statistiques',
          pt: '3. Cookies e Estatísticas',
          ar: '3. ملفات تعريف الارتباط (Cookies)',
        },
        paragraphs: {
          en: [
            'GetVidX uses minimal technical cookies strictly necessary for language preferences and service routing. Standard anonymous web traffic telemetry may be analyzed to safeguard service stability and prevent distributed denial-of-service abuse.',
          ],
          es: [
            'GetVidX utiliza únicamente cookies técnicas indispensables para recordar tu idioma y garantizar la estabilidad del servicio frente a abusos.',
          ],
          fr: [
            'GetVidX n’utilise que les cookies techniques strictement nécessaires au choix de langue et à la prévention des abus DDoS.',
          ],
          pt: [
            'O GetVidX utiliza apenas cookies técnicos necessários para preferências de idioma e prevenção de tráfego abusivo.',
          ],
          ar: [
            'يستخدم موقع GetVidX ملفات تعريف ارتباط فنية أساسية لحفظ اختيارك للغة وضمان استقرار وسرعة الخدمة ومكافحة هجمات حجب الخدمة الآلية.',
          ],
        },
      },
    ],
  },

  dmca: {
    slug: 'dmca',
    title: {
      en: 'DMCA & Copyright Policy - GetVidX',
      es: 'Política DMCA y Derechos de Autor - GetVidX',
      fr: 'Politique DMCA et Droits d’Auteur - GetVidX',
      pt: 'Política DMCA e Direitos Autorais - GetVidX',
      ar: 'حقوق الملكية الفكرية وسياسة DMCA - GetVidX',
    },
    h1: {
      en: 'DMCA & Copyright Policy',
      es: 'Política DMCA y Propiedad Intelectual',
      fr: 'Politique DMCA et Droits d’Auteur',
      pt: 'Política DMCA e Direitos Autorais',
      ar: 'حقوق الملكية الفكرية وسياسة إشعار DMCA',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: '1. Notice and Takedown Compliance',
          es: '1. Cumplimiento de Avisos de Retirada',
          fr: '1. Conformité aux Avis de Retrait',
          pt: '1. Conformidade com Notificações de Remoção',
          ar: '1. الامتثال لإشعارات إزالة المحتوى',
        },
        paragraphs: {
          en: [
            'GetVidX respects the intellectual property rights of copyright holders and complies with the Digital Millennium Copyright Act (17 U.S.C. § 512) and international copyright legislation.',
            'Because GetVidX does not host any media files and solely acts as a technical user-agent conduit to public Twitter CDN nodes, removing the video from Twitter / X immediately renders it unreachable on GetVidX.',
          ],
          es: [
            'GetVidX respeta la propiedad intelectual y cumple con la Digital Millennium Copyright Act (DMCA) y tratados internacionales.',
            'Dado que GetVidX no almacena ningún archivo multimedia en sus servidores, retirar el contenido de Twitter / X hace que resulte inaccesible de forma automática.',
          ],
          fr: [
            'GetVidX respecte les droits d’auteur et se conforme à la loi DMCA (Digital Millennium Copyright Act).',
            'Étant donné que GetVidX n’héberge aucun fichier vidéo, la suppression du contenu sur Twitter empêche immédiatement tout téléchargement via notre plateforme.',
          ],
          pt: [
            'O GetVidX respeita os direitos autorais e cumpre com a legislação DMCA e normas internacionais.',
            'Como o GetVidX não hospeda mídias em seus servidores, a remoção do tweet no X elimina automaticamente o acesso aos arquivos.',
          ],
          ar: [
            'يحترم موقع GetVidX حقوق الملكية الفكرية لأصحاب المحتوى ويلتزم ببنود قانون الألفية الرقمية لحقوق النشر (DMCA) والمعاهدات الدولية ذات الصلة.',
            'نظراً لأن GetVidX لا يستضيف أو يخزن أي ملفات وسائط على خوادمه الخاصة ويعمل فقط كأداة لاستخراج الروابط العامة من خوادم تويتر، فإن قيام صاحب الحقوق بحذف أو إبلاغ تويتر لحذف التغريدة الأصلية يمنع تنزيلها فوراً عبر موقعنا.',
          ],
        },
      },
      {
        heading: {
          en: '2. Submitting an Infringement Notice',
          es: '2. Envío de Notificaciones de Infracción',
          fr: '2. Signalement d’Infraction',
          pt: '2. Envio de Notificação de Infração',
          ar: '2. تقديم إشعار انتهاك حقوق الملكية',
        },
        paragraphs: {
          en: [
            'If you are a copyright owner or authorized agent wishing to restrict our platform from resolving links to your specific works, contact us with: (a) Identification of copyrighted work, (b) Exact tweet URLs, (c) Your contact info, and (d) A good-faith statement.',
            'Contact our designated copyright agent via email at: copyright@getvidx.com',
          ],
          es: [
            'Si eres titular de derechos y deseas bloquear el análisis de enlaces a tus obras, contáctanos indicando: (a) Identificación de la obra, (b) URLs exactas de los tweets, (c) Datos de contacto y (d) Declaración de buena fe.',
            'Escribe a nuestro responsable de derechos en: copyright@getvidx.com',
          ],
          fr: [
            'Si vous êtes titulaire de droits, contactez-nous avec : (a) Description de l’œuvre, (b) Liens exacts des tweets, (c) Vos coordonnées complètes et (d) Une déclaration sur l’honneur.',
            'Contactez notre agent désigné à : copyright@getvidx.com',
          ],
          pt: [
            'Para solicitar o bloqueio de links protegidos, envie: (a) Identificação da obra, (b) URLs exatas dos tweets, (c) Informações de contato e (d) Declaração de boa-fé.',
            'Envie sua solicitação para: copyright@getvidx.com',
          ],
          ar: [
            'إذا كنت صاحب حق ملكية وترغب في حظر فحص روابط لتغريدات معينة، يرجى تزويدنا بالتالي: (أ) وصف العمل المحمي، (ب) روابط التغريدات الدقيقة، (ج) بيانات التواصل الرسمية، (د) إقرار بحسن النية.',
            'يمكنك التواصل مع فريق مراجعة حقوق الملكية عبر البريد الإلكتروني: copyright@getvidx.com',
          ],
        },
      },
    ],
  },

  about: {
    slug: 'about',
    title: {
      en: 'About GetVidX - High-Speed Media Retriever',
      es: 'Acerca de GetVidX - Extractor Multimedia de Alta Velocidad',
      fr: 'À Propos de GetVidX - Téléchargeur Haute Vitesse',
      pt: 'Sobre o GetVidX - Extrator de Mídia em Alta Velocidade',
      ar: 'عن موقع GetVidX - منصة استخراج وتحميل وسائط تويتر',
    },
    h1: {
      en: 'About GetVidX',
      es: 'Acerca de GetVidX',
      fr: 'À Propos de GetVidX',
      pt: 'Sobre o GetVidX',
      ar: 'عن موقع ومنصة GetVidX',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: 'Our Mission',
          es: 'Nuestra Misión',
          fr: 'Notre Mission',
          pt: 'Nossa Missão',
          ar: 'مهمتنا ورؤيتنا',
        },
        paragraphs: {
          en: [
            'GetVidX was founded with a singular focus: build the cleanest, fastest, and most honest media downloader for Twitter (X). We remove misleading popup ads, eliminate bloated server storage, and deliver direct media streams in under 1.5 seconds.',
            'We believe users deserve an easy way to save public educational clips, comedy memes, news updates, and music performances for offline viewing without requiring invasive software installations.',
          ],
          es: [
            'GetVidX nació con un objetivo claro: crear la herramienta más rápida, limpia y honesta para descargar medios de Twitter (X). Sin publicidad engañosa ni instalaciones complejas.',
            'Creemos que los usuarios merecen una forma directa de guardar vídeos formativos, noticias y memes para su visualización offline sin complicaciones.',
          ],
          fr: [
            'GetVidX a été créé avec un objectif : proposer le téléchargeur le plus rapide, propre et transparent pour Twitter (X), sans popups intrusifs ni logiciels encombrants.',
            'Nous offrons une solution simple pour sauvegarder vos contenus favoris pour une consultation hors ligne en toute liberté.',
          ],
          pt: [
            'O GetVidX foi desenvolvido com um propósito simples: ser a ferramenta mais rápida, limpa e confiável para salvar mídias do Twitter (X).',
            'Acreditamos que você merece guardar vídeos educativos, notícias e memes para assistir offline sem complicações nem aplicativos invasivos.',
          ],
          ar: [
            'تأسس موقع GetVidX بهدف محدد ورئيسي: بناء الأداة الأسرع والأكثر نقاءً ومصداقية لتحميل وسائط تويتر / X. نحن نرفض النوافذ المنبثقة الخادعة، ولا نقوم بتخزين ملفات المستخدمين، ونقدم الروابط المباشرة في أقل من 1.5 ثانية.',
            'نؤمن بأن لكل مستخدم الحق في حفظ المقاطع التعليمية، الأخبار، والمقاطع الترفيهية المفضلة لمشاهدتها في أي وقت دون اتصال بالإنترنت ودون الحاجة لتثبيت برامج ثقيلة.',
          ],
        },
      },
    ],
  },

  contact: {
    slug: 'contact',
    title: {
      en: 'Contact Us - GetVidX Support & Inquiries',
      es: 'Contacto - Soporte y Consultas GetVidX',
      fr: 'Contactez-nous - Support GetVidX',
      pt: 'Contato - Suporte e Dúvidas GetVidX',
      ar: 'اتصل بنا - الدعم الفني والاستفسارات - GetVidX',
    },
    h1: {
      en: 'Contact Us',
      es: 'Contacto',
      fr: 'Contactez-nous',
      pt: 'Entre em Contato',
      ar: 'اتصل بنا ومركز الدعم الفني',
    },
    lastUpdated: 'March 2026',
    sections: [
      {
        heading: {
          en: 'Get in Touch',
          es: 'Ponte en Contacto',
          fr: 'Nous Joindre',
          pt: 'Fale Conosco',
          ar: 'تواصل مع فريق الدعم',
        },
        paragraphs: {
          en: [
            'Have questions, feedback, or need technical assistance with a tweet link? Our team is available to assist you.',
            'Official Email: support@getvidx.com',
            'Business Hours: Monday – Friday, 09:00 - 18:00 UTC. We strive to respond to all inquiries within 24 to 48 hours.',
          ],
          es: [
            '¿Tienes dudas, sugerencias o problemas técnicos con un enlace? Nuestro equipo está a tu disposición.',
            'Correo electrónico oficial: support@getvidx.com',
            'Horario de atención: Lunes a viernes de 09:00 a 18:00 UTC. Respondemos habitualmente en un plazo de 24 a 48 horas.',
          ],
          fr: [
            'Vous avez une question, une suggestion ou un problème technique avec un lien ? Notre équipe est à votre écoute.',
            'Courriel officiel : support@getvidx.com',
            'Horaires : du lundi au vendredi, 09h00 - 18h00 UTC. Réponse sous 24 à 48 heures.',
          ],
          pt: [
            'Tem dúvidas, sugestões ou encontrou problemas com algum link? Nossa equipe está pronta para ajudar.',
            'E-mail oficial: support@getvidx.com',
            'Horário de atendimento: Segunda a sexta, 09:00 às 18:00 UTC. Respondemos em até 24 a 48 horas.',
          ],
          ar: [
            'هل لديك أي استفسار أو اقتراح أو تواجه صعوبة في فحص رابط تغريدة معينة؟ فريقنا مستعد دائماً لتقديم المساعدة.',
            'البريد الإلكتروني الرسمي للدعم: support@getvidx.com',
            'ساعات العمل: من الاثنين إلى الجمعة، 09:00 - 18:00 بتوقيت غرينتش (UTC). نحرص على الرد على كافة الرسائل في غضون 24 إلى 48 ساعة.',
          ],
        },
      },
    ],
  },
};
